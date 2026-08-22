import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyNowpaymentsIpn } from '@majara/utils';

export interface NowpaymentsInvoice {
  id: string | number;
  invoice_url?: string;
}

@Injectable()
export class NowpaymentsProvider {
  constructor(private readonly config: ConfigService) {}

  get apiUrl() {
    return this.config.get<string>('NOWPAYMENTS_API_URL') ?? 'https://api.nowpayments.io';
  }

  get payCurrency() {
    return this.config.get<string>('NOWPAYMENTS_PAY_CURRENCY') ?? 'usdttrc20';
  }

  async createInvoice(input: {
    priceUsd: number;
    orderId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const apiKey = this.config.get<string>('NOWPAYMENTS_API_KEY');
    if (!apiKey) throw new Error('NOWPAYMENTS_API_KEY is missing');

    const response = await fetch(`${this.apiUrl}/v1/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        price_amount: input.priceUsd,
        price_currency: 'usd',
        pay_currency: this.payCurrency,
        ipn_callback_url: this.config.get<string>('NOWPAYMENTS_IPN_URL'),
        order_id: input.orderId,
        order_description: 'Majara magazine',
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
      }),
    });
    const body = (await response.json()) as NowpaymentsInvoice & { message?: string };
    if (!response.ok || !body.id) {
      throw new Error(body.message ?? 'NowPayments invoice failed');
    }
    return body;
  }

  verifyIpn(body: Record<string, unknown>, signature: string | undefined) {
    const secret = this.config.get<string>('NOWPAYMENTS_IPN_SECRET');
    if (!secret || !signature) return false;
    return verifyNowpaymentsIpn(body, signature, secret);
  }

  isPaid(status: string | undefined) {
    return status === 'finished' || status === 'confirmed';
  }
}
