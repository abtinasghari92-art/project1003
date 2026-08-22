import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminOrdersQueryDto, CreateCustomerNoteDto } from './admin.dto';

const identitySelect = {
  telegram: { select: { telegramId: true, username: true, firstName: true, lastName: true } },
  bale: { select: { baleId: true, username: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class AdminCrmService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [customers, paidOrders, pendingPayments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count({ where: { status: 'PAID' } }),
      this.prisma.payment.count({ where: { status: { in: ['PENDING', 'REDIRECTED'] } } }),
    ]);
    return { customers, paidOrders, pendingPayments };
  }

  async listCustomers(q?: string) {
    const where: Prisma.UserWhereInput = q?.trim()
      ? {
          OR: [
            { phone: { contains: q.trim() } },
            { telegram: { username: { contains: q.trim(), mode: 'insensitive' } } },
            { bale: { username: { contains: q.trim(), mode: 'insensitive' } } },
          ],
        }
      : {};

    const users = await this.prisma.user.findMany({
      where,
      include: {
        ...identitySelect,
        _count: { select: { orders: true, notes: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return users.map((user) => ({
      id: user.id,
      phone: user.phone,
      createdAt: user.createdAt,
      telegram: user.telegram,
      bale: user.bale,
      ordersCount: user._count.orders,
      notesCount: user._count.notes,
    }));
  }

  async getCustomer(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        ...identitySelect,
        orders: {
          include: {
            items: true,
            payments: { orderBy: { createdAt: 'desc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          include: { admin: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user) throw new NotFoundException('مشتری یافت نشد');
    return user;
  }

  async addNote(userId: string, adminId: string, dto: CreateCustomerNoteDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('مشتری یافت نشد');

    return this.prisma.customerNote.create({
      data: { userId, adminId, body: dto.body.trim() },
      include: { admin: { select: { id: true, name: true, email: true } } },
    });
  }

  async listOrders(query: AdminOrdersQueryDto) {
    const orders = await this.prisma.order.findMany({
      where: {
        status: query.status,
        payments: query.provider ? { some: { provider: query.provider } } : undefined,
      },
      include: {
        user: { include: identitySelect },
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return orders;
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { include: identitySelect },
        items: { include: { issue: { include: { magazine: true } } } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    return order;
  }
}
