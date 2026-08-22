import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateIssueDto,
  CreateMagazineDto,
  UpdateIssueDto,
  UpdateMagazineDto,
} from './admin.dto';

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listMagazines() {
    return this.prisma.magazine.findMany({
      include: { issues: { orderBy: { number: 'desc' } } },
      orderBy: { title: 'asc' },
    });
  }

  createMagazine(dto: CreateMagazineDto) {
    return this.prisma.magazine
      .create({
        data: {
          title: dto.title.trim(),
          slug: dto.slug.trim(),
          description: dto.description?.trim() || null,
          coverUrl: dto.coverUrl?.trim() || null,
        },
        include: { issues: true },
      })
      .catch((error) => this.rethrowRelation(error, 'slug تکراری است'));
  }

  async updateMagazine(id: string, dto: UpdateMagazineDto) {
    await this.requireMagazine(id);
    return this.prisma.magazine.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        slug: dto.slug?.trim(),
        description: dto.description === undefined ? undefined : dto.description.trim() || null,
        coverUrl: dto.coverUrl === undefined ? undefined : dto.coverUrl.trim() || null,
      },
      include: { issues: { orderBy: { number: 'desc' } } },
    });
  }

  async deleteMagazine(id: string) {
    await this.requireMagazine(id);
    try {
      await this.prisma.magazine.delete({ where: { id } });
    } catch (error) {
      this.rethrowRelation(error, 'نمی‌توان مجله‌ای که سفارش یا سبد دارد را حذف کرد');
    }
    return { ok: true };
  }

  async createIssue(dto: CreateIssueDto) {
    await this.requireMagazine(dto.magazineId);
    return this.prisma.issue.create({
      data: {
        magazineId: dto.magazineId,
        title: dto.title.trim(),
        number: dto.number,
        priceRial: dto.priceRial,
        coverUrl: dto.coverUrl?.trim() || null,
        pdfKey: dto.pdfKey?.trim() || null,
      },
    });
  }

  async updateIssue(id: string, dto: UpdateIssueDto) {
    await this.requireIssue(id);
    return this.prisma.issue.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        number: dto.number,
        priceRial: dto.priceRial,
        coverUrl: dto.coverUrl === undefined ? undefined : dto.coverUrl.trim() || null,
        pdfKey: dto.pdfKey === undefined ? undefined : dto.pdfKey.trim() || null,
      },
    });
  }

  async deleteIssue(id: string) {
    await this.requireIssue(id);
    try {
      await this.prisma.issue.delete({ where: { id } });
    } catch (error) {
      this.rethrowRelation(error, 'نمی‌توان شماره‌ای که در سبد یا سفارش است را حذف کرد');
    }
    return { ok: true };
  }

  private async requireMagazine(id: string) {
    const magazine = await this.prisma.magazine.findUnique({ where: { id } });
    if (!magazine) throw new NotFoundException('مجله یافت نشد');
    return magazine;
  }

  private async requireIssue(id: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException('شماره یافت نشد');
    return issue;
  }

  private rethrowRelation(error: unknown, message: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2003' || error.code === 'P2014')) {
      throw new BadRequestException(message);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new BadRequestException('مقدار تکراری است');
    }
    throw error;
  }
}
