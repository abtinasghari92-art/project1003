import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { orderAmountRial, resolveShippingRial, rialToUsd } from '@majara/utils';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import type { CheckoutDto } from './orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly config: ConfigService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.cart.getOrCreate(userId);
    const sourceItems = cart.items.length > 0 ? cart.items : await this.fixtureItems();

    const subtotalRial = sourceItems.reduce(
      (sum, item) => sum + item.issue.priceRial * item.qty,
      0,
    );
    const shippingRial = resolveShippingRial(this.config.get('SHIPPING_RIAL'));
    const amountRial = orderAmountRial(subtotalRial, shippingRial);
    const rate = Number(this.config.get('USD_TO_IRR_RATE') ?? 800000);
    const notes = dto.notes?.trim() ? dto.notes.trim() : null;

    const order = await this.prisma.order.create({
      data: {
        userId,
        amountRial,
        amountUsd: rialToUsd(amountRial, rate),
        shippingRial,
        firstName: dto.firstName,
        lastName: dto.lastName,
        province: dto.province,
        city: dto.city,
        street: dto.street,
        postalCode: dto.postalCode,
        phone: dto.phone,
        notes,
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

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        province: dto.province,
        city: dto.city,
        street: dto.street,
        postalCode: dto.postalCode,
      },
    });

    if (cart.items.length > 0) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return this.toDto(order);
  }

  list(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private toDto(order: {
    id: string;
    status: 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'CANCELED';
    amountRial: number;
    amountUsd: unknown;
    shippingRial: number;
    firstName: string | null;
    lastName: string | null;
    province: string | null;
    city: string | null;
    street: string | null;
    postalCode: string | null;
    phone: string | null;
    notes: string | null;
    items: { id: string; title: string; priceRial: number; qty: number }[];
  }) {
    return {
      id: order.id,
      status: order.status,
      amountRial: order.amountRial,
      amountUsd: order.amountUsd == null ? null : String(order.amountUsd),
      shippingRial: order.shippingRial,
      firstName: order.firstName,
      lastName: order.lastName,
      province: order.province,
      city: order.city,
      street: order.street,
      postalCode: order.postalCode,
      phone: order.phone,
      notes: order.notes,
      items: order.items,
    };
  }

  private async fixtureItems() {
    const fallback = await this.prisma.issue.findFirst({ orderBy: { number: 'desc' } });
    if (!fallback) throw new BadRequestException('شماره‌ای برای خرید وجود ندارد');
    return [{ issueId: fallback.id, qty: 1, issue: fallback }];
  }
}
