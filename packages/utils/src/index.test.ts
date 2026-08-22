import { createHmac } from 'node:crypto';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRial,
  generateOtpCode,
  hashOtp,
  normalizePhone,
  rialToUsd,
  safeEqual,
  verifyNowpaymentsIpn,
} from './index';

describe('normalizePhone', () => {
  it('accepts 09xxxxxxxxx', () => {
    assert.equal(normalizePhone('09123456789'), '09123456789');
  });
  it('converts +98', () => {
    assert.equal(normalizePhone('+989123456789'), '09123456789');
  });
});

describe('otp', () => {
  it('generates 6 digits', () => {
    assert.match(generateOtpCode(), /^\d{6}$/);
  });
  it('hashes stably', () => {
    assert.equal(hashOtp('123456', 'p'), hashOtp('123456', 'p'));
    assert.notEqual(hashOtp('123456', 'p'), hashOtp('000000', 'p'));
  });
});

describe('money', () => {
  it('converts rial to usd', () => {
    assert.equal(rialToUsd(800_000, 800_000), 1);
  });
  it('formats rial in fa-IR', () => {
    assert.ok(formatRial(250000).length > 0);
  });
});

describe('nowpayments ipn', () => {
  it('rejects a bad signature', () => {
    assert.equal(verifyNowpaymentsIpn({ payment_id: 1 }, 'deadbeef', 'secret'), false);
  });
  it('accepts a matching signature', () => {
    const body = { payment_status: 'finished', order_id: 'abc' };
    const payload = JSON.stringify(body, Object.keys(body).sort());
    const sig = createHmac('sha512', 'secret').update(payload).digest('hex');
    assert.equal(verifyNowpaymentsIpn(body, sig, 'secret'), true);
  });
});

describe('safeEqual', () => {
  it('compares equal strings', () => {
    assert.equal(safeEqual('abc', 'abc'), true);
    assert.equal(safeEqual('abc', 'abd'), false);
  });
});
