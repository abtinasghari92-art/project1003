import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MagazinesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.magazine.findMany({
      include: { issues: { orderBy: { number: 'desc' } } },
      orderBy: { title: 'asc' },
    });
  }

  async getBySlug(slug: string) {
    const magazine = await this.prisma.magazine.findUnique({
      where: { slug },
      include: { issues: { orderBy: { number: 'desc' } } },
    });
    if (!magazine) throw new NotFoundException('مجله پیدا نشد');
    return magazine;
  }
}
