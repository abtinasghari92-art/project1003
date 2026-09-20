import { Injectable, BadRequestException } from '@nestjs/common';
import { AnalyticsChannel, CommentStatus, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AnalyticsEventDto, AnalyticsQueryDto } from '../admin/admin.dto';

const ALLOWED_EVENTS = new Set([
  'page_view',
  'issue_view',
  'preview_open',
  'add_to_cart',
  'checkout_start',
  'purchase_success',
  'purchase_failed',
  'share_issue',
  'gift_issue',
  'search',
  'filter_catalog',
  'comment_submit',
  'comment_vote',
  'cta_click',
]);

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(dto: AnalyticsEventDto, userId?: string) {
    if (!ALLOWED_EVENTS.has(dto.name)) throw new BadRequestException('رویداد پشتیبانی نمی‌شود');
    let issueId = dto.issueId;
    if (issueId) {
      const issue = await this.prisma.issue.findUnique({ where: { id: issueId }, select: { id: true } });
      if (!issue) issueId = undefined;
    }
    const metadata = dto.metadata
      ? Object.fromEntries(Object.entries(dto.metadata).filter(([key]) => ['source', 'label', 'value', 'position', 'query'].includes(key)))
      : undefined;
    try {
      return await this.prisma.analyticsEvent.create({
        data: {
          eventId: dto.eventId,
          channel: dto.channel,
          name: dto.name,
          sessionId: dto.sessionId,
          userId,
          issueId,
          path: dto.path,
          metadata,
          occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { duplicate: true };
      throw error;
    }
  }

  async overview(query: AnalyticsQueryDto) {
    const { from, to, channel } = this.range(query);
    const eventWhere: Prisma.AnalyticsEventWhereInput = {
      occurredAt: { gte: from, lte: to },
      channel,
    };
    const orderWhere: Prisma.OrderWhereInput = {
      status: OrderStatus.PAID,
      createdAt: { gte: from, lte: to },
      payments: channel ? { some: { channel } } : undefined,
    };
    const [events, sessions, users, paidOrders, revenue, pendingComments, topEventGroups] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: eventWhere }),
      this.prisma.analyticsEvent.findMany({ where: eventWhere, select: { sessionId: true }, distinct: ['sessionId'] }),
      this.prisma.analyticsEvent.findMany({ where: { ...eventWhere, userId: { not: null } }, select: { userId: true }, distinct: ['userId'] }),
      this.prisma.order.count({ where: orderWhere }),
      this.prisma.order.aggregate({ where: orderWhere, _sum: { amountRial: true } }),
      this.prisma.comment.count({ where: { status: CommentStatus.PENDING } }),
      this.prisma.analyticsEvent.groupBy({ by: ['name'], where: eventWhere, _count: { _all: true }, orderBy: { _count: { name: 'desc' } }, take: 12 }),
    ]);
    const views = topEventGroups.find((item) => item.name === 'issue_view')?._count._all ?? 0;
    const carts = topEventGroups.find((item) => item.name === 'add_to_cart')?._count._all ?? 0;
    const checkouts = topEventGroups.find((item) => item.name === 'checkout_start')?._count._all ?? 0;
    return {
      from,
      to,
      channel: channel ?? 'ALL',
      events,
      sessions: sessions.length,
      users: users.length,
      paidOrders,
      revenueRial: revenue._sum.amountRial ?? 0,
      pendingComments,
      conversion: {
        views,
        carts,
        checkouts,
        purchases: paidOrders,
        viewToCart: views ? carts / views : 0,
        cartToCheckout: carts ? checkouts / carts : 0,
        checkoutToPurchase: checkouts ? paidOrders / checkouts : 0,
      },
      eventBreakdown: topEventGroups.map((item) => ({ name: item.name, count: item._count._all })),
      timeline: await this.timeline(eventWhere, from, to),
      channels: await this.channelBreakdown(from, to),
    };
  }

  async createSnapshot(adminId: string, query: AnalyticsQueryDto, periodType = 'CUSTOM') {
    const { from, to, channel } = this.range(query);
    const summary = await this.overview({ from: from.toISOString(), to: to.toISOString(), channel });
    const snapshot = await this.prisma.reportSnapshot.create({
      data: { periodType, from, to, channel, summary: summary as unknown as Prisma.InputJsonValue, createdById: adminId },
    });
    await this.prisma.adminNotification.create({ data: { adminId, title: 'گزارش جدید آماده است', body: `گزارش ${periodType} برای دانلود ذخیره شد.` } });
    return snapshot;
  }

  listSnapshots() {
    return this.prisma.reportSnapshot.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { createdBy: { select: { name: true } } } });
  }

  async csv(query: AnalyticsQueryDto) {
    const data = await this.overview(query);
    const rows = [
      ['شاخص', 'مقدار'],
      ['از', data.from.toISOString()],
      ['تا', data.to.toISOString()],
      ['کانال', data.channel],
      ['رویدادها', data.events],
      ['نشست‌ها', data.sessions],
      ['کاربران', data.users],
      ['سفارش پرداخت‌شده', data.paidOrders],
      ['درآمد ریالی', data.revenueRial],
      ['کامنت در انتظار', data.pendingComments],
      ['مشاهده شماره', data.conversion.views],
      ['افزودن به سبد', data.conversion.carts],
      ['شروع پرداخت', data.conversion.checkouts],
    ];
    return '\uFEFF' + rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  }

  async notifications(adminId: string) {
    return this.prisma.adminNotification.findMany({ where: { adminId }, orderBy: { createdAt: 'desc' }, take: 30 });
  }

  async markNotificationRead(id: string, adminId: string) {
    return this.prisma.adminNotification.updateMany({ where: { id, adminId }, data: { readAt: new Date() } });
  }

  private range(query: AnalyticsQueryDto) {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from ? new Date(query.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from, to, channel: query.channel as AnalyticsChannel | undefined };
  }

  private async timeline(where: Prisma.AnalyticsEventWhereInput, from: Date, to: Date) {
    const rows = await this.prisma.analyticsEvent.findMany({ where, select: { name: true, occurredAt: true }, orderBy: { occurredAt: 'asc' }, take: 20_000 });
    const days = new Map<string, { date: string; views: number; carts: number; purchases: number }>();
    for (let cursor = new Date(from); cursor <= to; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const date = cursor.toISOString().slice(0, 10);
      days.set(date, { date, views: 0, carts: 0, purchases: 0 });
    }
    for (const row of rows) {
      const item = days.get(row.occurredAt.toISOString().slice(0, 10));
      if (!item) continue;
      if (row.name === 'issue_view') item.views += 1;
      if (row.name === 'add_to_cart') item.carts += 1;
      if (row.name === 'purchase_success') item.purchases += 1;
    }
    return [...days.values()];
  }

  private async channelBreakdown(from: Date, to: Date) {
    const rows = await this.prisma.analyticsEvent.groupBy({ by: ['channel'], where: { occurredAt: { gte: from, lte: to } }, _count: { _all: true } });
    return rows.map((row) => ({ channel: row.channel, events: row._count._all }));
  }
}
