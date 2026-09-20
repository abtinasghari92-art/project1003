import { createHash } from 'node:crypto';
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, CommentStatus, CommentVoteValue } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AdminCommentsQueryDto,
  CommentCreateDto,
  CommentReplyDto,
  CommentVoteDto,
  UpdateCommentDto,
} from '../admin/admin.dto';

type PublicUser = { id: string; telegram?: { username: string | null } | null; bale?: { username: string | null } | null };

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(issueId: string) {
    const rows = await this.prisma.comment.findMany({
      where: { issueId, status: CommentStatus.APPROVED },
      include: { user: { include: { telegram: true, bale: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toPublic(row));
  }

  async create(dto: CommentCreateDto, user: PublicUser | null, ip: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id: dto.issueId } });
    if (!issue) throw new NotFoundException('شماره پیدا نشد');
    if (!user && !dto.guestName?.trim()) throw new BadRequestException('نام نمایشی الزامی است');
    if (dto.stars > 5) throw new BadRequestException('امتیاز باید بین ۱ تا ۵ باشد');

    const submissionKey = this.key(user ? `user:${user.id}` : `ip:${ip}`);
    const recent = await this.prisma.comment.count({
      where: { submissionKey, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recent >= 5) throw new HttpException('تعداد ارسال کامنت در این بازه بیش از حد مجاز است', HttpStatus.TOO_MANY_REQUESTS);

    const created = await this.prisma.comment.create({
      data: {
        issueId: dto.issueId,
        userId: user?.id,
        guestName: user ? null : dto.guestName?.trim(),
        submissionKey,
        body: dto.body.trim(),
        stars: dto.stars,
      },
    });
    return { id: created.id, status: created.status, message: 'کامنت شما پس از بررسی نمایش داده می‌شود' };
  }

  async vote(id: string, dto: CommentVoteDto, user: PublicUser | null, ip: string) {
    const comment = await this.prisma.comment.findFirst({ where: { id, status: CommentStatus.APPROVED } });
    if (!comment) throw new NotFoundException('کامنت پیدا نشد');
    const voterKey = user ? `user:${user.id}` : `guest:${this.key(`${dto.clientKey}:${ip}`)}`;
    const nextValue = dto.value as CommentVoteValue;

    await this.prisma.$transaction(async (tx) => {
      const previous = await tx.commentVote.findUnique({ where: { commentId_voterKey: { commentId: id, voterKey } } });
      if (previous?.value === nextValue) return;
      if (previous) {
        await tx.comment.update({
          where: { id },
          data: previous.value === CommentVoteValue.UP ? { helpfulUp: { decrement: 1 } } : { helpfulDown: { decrement: 1 } },
        });
        await tx.commentVote.update({ where: { id: previous.id }, data: { value: nextValue } });
      } else {
        await tx.commentVote.create({ data: { commentId: id, userId: user?.id, voterKey, value: nextValue } });
      }
      await tx.comment.update({
        where: { id },
        data: nextValue === CommentVoteValue.UP ? { helpfulUp: { increment: 1 } } : { helpfulDown: { increment: 1 } },
      });
    });
    return this.prisma.comment.findUniqueOrThrow({ where: { id }, select: { helpfulUp: true, helpfulDown: true } });
  }

  async listAdmin(query: AdminCommentsQueryDto) {
    const where: Prisma.CommentWhereInput = {
      status: query.status,
      issueId: query.issueId,
      stars: query.stars,
      OR: query.q?.trim()
        ? [{ body: { contains: query.q.trim(), mode: 'insensitive' } }, { guestName: { contains: query.q.trim(), mode: 'insensitive' } }]
        : undefined,
    };
    return this.prisma.comment.findMany({
      where,
      include: {
        issue: { select: { id: true, title: true, number: true, magazine: { select: { title: true } } } },
        user: { include: { telegram: true, bale: true } },
        repliedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 250,
    });
  }

  async moderate(id: string, status: CommentStatus, adminId: string) {
    const comment = await this.prisma.comment.update({ where: { id }, data: { status, moderatedAt: new Date() } });
    await this.audit(adminId, status === CommentStatus.APPROVED ? 'comment.approve' : 'comment.reject', id);
    return comment;
  }

  async bulkModerate(ids: string[], status: CommentStatus, adminId: string) {
    const result = await this.prisma.comment.updateMany({ where: { id: { in: ids } }, data: { status, moderatedAt: new Date() } });
    await this.audit(adminId, status === CommentStatus.APPROVED ? 'comment.bulk_approve' : 'comment.bulk_reject', undefined, { count: result.count });
    return { count: result.count };
  }

  async update(id: string, dto: UpdateCommentDto, adminId: string) {
    if (dto.stars !== undefined && dto.stars > 5) throw new BadRequestException('امتیاز باید بین ۱ تا ۵ باشد');
    const comment = await this.prisma.comment.update({ where: { id }, data: { body: dto.body?.trim(), stars: dto.stars } });
    await this.audit(adminId, 'comment.update', id);
    return comment;
  }

  async reply(id: string, dto: CommentReplyDto, adminId: string) {
    const comment = await this.prisma.comment.update({
      where: { id },
      data: { adminReply: dto.body.trim(), repliedById: adminId },
    });
    await this.audit(adminId, 'comment.reply', id);
    return comment;
  }

  async remove(id: string, adminId: string) {
    await this.prisma.comment.delete({ where: { id } });
    await this.audit(adminId, 'comment.delete', id);
    return { ok: true };
  }

  private async audit(adminId: string, action: string, entityId?: string, metadata?: Record<string, number>) {
    await this.prisma.adminAuditLog.create({ data: { adminId, action, entityType: 'Comment', entityId, metadata } });
  }

  private key(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private toPublic(row: any) {
    const identity = row.user?.telegram?.username || row.user?.bale?.username;
    return {
      id: row.id,
      name: row.guestName || (identity ? `@${identity}` : 'خواننده ماجرا'),
      body: row.body,
      stars: row.stars,
      helpfulCount: row.helpfulUp,
      helpfulDown: row.helpfulDown,
      adminReply: row.adminReply,
      date: row.createdAt,
    };
  }
}
