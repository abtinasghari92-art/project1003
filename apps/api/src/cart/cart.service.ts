import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { items: { include: { issue: true } } },
    });
  }

  async addItem(userId: string, issueId: string, qty = 1) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('شماره مجله پیدا نشد');
    const cart = await this.getOrCreate(userId);
    await this.prisma.cartItem.upsert({
      where: { cartId_issueId: { cartId: cart.id, issueId } },
      update: { qty },
      create: { cartId: cart.id, issueId, qty },
    });
    return this.getOrCreate(userId);
  }

  async removeItem(userId: string, issueId: string) {
    const cart = await this.getOrCreate(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, issueId } });
    return this.getOrCreate(userId);
  }

  toDto(cart: Awaited<ReturnType<CartService['getOrCreate']>>) {
    const items = cart.items.map((item) => ({
      id: item.id,
      issueId: item.issueId,
      title: item.issue.title,
      priceRial: item.issue.priceRial,
      qty: item.qty,
    }));
    return {
      id: cart.id,
      items,
      totalRial: items.reduce((sum, item) => sum + item.priceRial * item.qty, 0),
    };
  }
}
