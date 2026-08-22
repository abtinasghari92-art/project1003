import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { rialToUsd } from '@majara/utils';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly config: ConfigService,
  ) {}

  async checkout(userId: string) {
    const cart = await this.cart.getOrCreate(userId);
    const sourceItems =
      cart.items.length > 0
        ? cart.items
        : await this.fixtureItems();

    const amountRial = sourceItems.reduce(
      (sum, item) => sum + item.issue.priceRial * item.qty,
      0,
    );
    const rate = Number(this.config.get('USD_TO_IRR_RATE') ?? 800000);
    const order = await this.prisma.order.create({
      data: {
        userId,
        amountRial,
        amountUsd: rialToUsd(amountRial, rate),
        items: {
          create: sourceItems.map((item) => ({
            issueId: item.issueId,
            title: item.issue.title,
            priceRial: item.issue.priceRial,
            qty: item.qty,
          })),
        },
      },
      include: { items: true },
    });

    if (cart.items.length > 0) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return order;
  }

  list(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async fixtureItems() {
    const fallback = await this.prisma.issue.findFirst({ orderBy: { number: 'desc' } });
    if (!fallback) throw new BadRequestException('شماره‌ای برای خرید وجود ندارد');
    return [{ issueId: fallback.id, qty: 1, issue: fallback }];
  }
}
