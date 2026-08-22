import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ZibalProvider } from './providers/zibal.provider';
import { NowpaymentsProvider } from './providers/nowpayments.provider';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly zibal: ZibalProvider,
    private readonly nowpayments: NowpaymentsProvider,
  ) {}

  async createIntent(userId: string, orderId: string, provider: PaymentProvider) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order || order.userId !== userId) throw new NotFoundException('سفارش پیدا نشد');
    if (order.status === 'PAID') throw new BadRequestException('این سفارش قبلاً پرداخت شده');

    if (provider === 'ZIBAL' && !order.user.phone) {
      throw new ForbiddenException('برای پرداخت ریالی ابتدا شماره موبایل را تایید کنید');
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider,
        amountRial: order.amountRial,
      },
    });

    if (provider === 'ZIBAL') {
      return this.startZibal(payment.id, order.id, order.amountRial);
    }
    return this.startNowpayments(payment.id, order);
  }

  async zibalCallback(trackId: string, success: string | undefined) {
    const payment = await this.prisma.payment.findFirst({
      where: { externalId: trackId, provider: 'ZIBAL' },
      include: { order: { include: { items: true } } },
    });
    if (!payment) throw new NotFoundException('تراکنش زیبال پیدا نشد');

    const appUrl = this.returnUrl();
    if (success === '0') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', rawPayload: { trackId, success } },
      });
      return { redirect: `${appUrl}/pay/result?status=failed&provider=zibal` };
    }

    const verified = await this.zibal.verify(trackId);
    if (!this.zibal.isPaid(verified.result)) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', rawPayload: verified as object },
      });
      return { redirect: `${appUrl}/pay/result?status=failed&provider=zibal` };
    }

    await this.fulfill(payment.orderId, payment.id, verified as object);
    return { redirect: `${appUrl}/pay/result?status=paid&provider=zibal` };
  }

  async nowpaymentsIpn(body: Record<string, unknown>, signature: string | undefined) {
    if (!this.nowpayments.verifyIpn(body, signature)) {
      throw new ForbiddenException('Invalid NowPayments signature');
    }

    const orderId = String(body.order_id ?? '');
    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        provider: 'NOWPAYMENTS',
        externalId: String(body.id ?? body.payment_id ?? ''),
      },
      orderBy: { createdAt: 'desc' },
    });

    const target =
      payment ??
      (await this.prisma.payment.findFirst({
        where: { orderId, provider: 'NOWPAYMENTS' },
        orderBy: { createdAt: 'desc' },
      }));

    if (!target) throw new NotFoundException('تراکنش کریپتو پیدا نشد');

    const status = String(body.payment_status ?? body.status ?? '');
    if (this.nowpayments.isPaid(status)) {
      await this.fulfill(target.orderId, target.id, body as object);
    } else if (status === 'failed' || status === 'expired' || status === 'refunded') {
      await this.prisma.payment.update({
        where: { id: target.id },
        data: {
          status: status === 'expired' ? PaymentStatus.EXPIRED : PaymentStatus.FAILED,
          rawPayload: body as Prisma.InputJsonValue,
        },
      });
    } else {
      await this.prisma.payment.update({
        where: { id: target.id },
        data: { rawPayload: body as Prisma.InputJsonValue },
      });
    }

    return { ok: true };
  }

  private async startZibal(paymentId: string, orderId: string, amountRial: number) {
    const callbackUrl = this.config.getOrThrow<string>('ZIBAL_CALLBACK_URL');
    const requested = await this.zibal.request({
      amount: amountRial,
      callbackUrl,
      orderId,
    });
    const redirectUrl = this.zibal.startUrl(requested.trackId!);
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REDIRECTED',
        externalId: String(requested.trackId),
        redirectUrl,
        rawPayload: requested as object,
      },
    });
    return {
      paymentId,
      provider: 'ZIBAL' as const,
      status: 'REDIRECTED' as const,
      redirectUrl,
    };
  }

  private async startNowpayments(
    paymentId: string,
    order: { id: string; amountUsd: unknown },
  ) {
    const priceUsd = Number(order.amountUsd ?? 1);
    const appUrl = this.returnUrl();
    const invoice = await this.nowpayments.createInvoice({
      priceUsd: priceUsd > 0 ? priceUsd : 1,
      orderId: order.id,
      successUrl: `${appUrl}/pay/result?status=paid&provider=nowpayments`,
      cancelUrl: `${appUrl}/pay/result?status=failed&provider=nowpayments`,
    });
    const redirectUrl = invoice.invoice_url ?? null;
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REDIRECTED',
        externalId: String(invoice.id),
        redirectUrl,
        rawPayload: invoice as object,
      },
    });
    return {
      paymentId,
      provider: 'NOWPAYMENTS' as const,
      status: 'REDIRECTED' as const,
      redirectUrl,
    };
  }

  private async fulfill(orderId: string, paymentId: string, payload: object) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) return;
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'PAID', rawPayload: payload },
      });
      if (order.status !== 'PAID') {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });
        for (const item of order.items) {
          await tx.entitlement.upsert({
            where: { userId_issueId: { userId: order.userId, issueId: item.issueId } },
            update: {},
            create: { userId: order.userId, issueId: item.issueId },
          });
        }
      }
    });
  }

  private returnUrl() {
    return (
      this.config.get('TELEGRAM_WEB_URL') ??
      this.config.get('BALE_WEB_URL') ??
      'http://localhost:3000'
    );
  }
}
