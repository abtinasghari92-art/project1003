import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ZibalRequestResult {
  result: number;
  message?: string;
  trackId?: number;
}

export interface ZibalVerifyResult {
  result: number;
  status?: number;
  amount?: number;
  message?: string;
  paidAt?: string;
  refNumber?: string;
}

@Injectable()
export class ZibalProvider {
  constructor(private readonly config: ConfigService) {}

  get merchant() {
    return this.config.get<string>('ZIBAL_MERCHANT') ?? 'zibal';
  }

  get baseUrl() {
    return this.config.get<string>('ZIBAL_GATEWAY_BASE') ?? 'https://gateway.zibal.ir';
  }

  startUrl(trackId: number | string) {
    return `${this.baseUrl}/start/${trackId}`;
  }

  async request(input: { amount: number; callbackUrl: string; orderId: string }) {
    const response = await fetch(`${this.baseUrl}/v1/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant: this.merchant,
        amount: input.amount,
        callbackUrl: input.callbackUrl,
        orderId: input.orderId,
        description: 'Majara magazine',
      }),
    });
    const body = (await response.json()) as ZibalRequestResult;
    if (body.result !== 100 || !body.trackId) {
      throw new Error(body.message ?? `Zibal request failed (${body.result})`);
    }
    return body;
  }

  async verify(trackId: number | string) {
    const response = await fetch(`${this.baseUrl}/v1/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant: this.merchant, trackId: Number(trackId) }),
    });
    return (await response.json()) as ZibalVerifyResult;
  }

  isPaid(result: number) {
    return result === 100 || result === 201;
  }
}
