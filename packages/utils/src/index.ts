import { createHmac, randomInt, timingSafeEqual, createHash } from 'node:crypto';

export function normalizePhone(input: string): string {
  const digits = input.replace(/[^\d]/g, '');
  if (digits.startsWith('0098')) return `0${digits.slice(4)}`;
  if (digits.startsWith('98')) return `0${digits.slice(2)}`;
  if (digits.startsWith('9') && digits.length === 10) return `0${digits}`;
  if (digits.startsWith('09') && digits.length === 11) return digits;
  throw new Error('INVALID_PHONE');
}

export function isIranMobile(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashOtp(code: string, pepper: string): string {
  return createHash('sha256').update(`${pepper}:${code}`).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function hmacSha256Hex(key: Buffer | string, data: string): string {
  return createHmac('sha256', key).update(data).digest('hex');
}

export function hmacSha512Hex(key: string, data: string): string {
  return createHmac('sha512', key).update(data).digest('hex');
}

/** Telegram Mini App initData HMAC (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app) */
export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86_400,
): Record<string, string> {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) throw new Error('MISSING_HASH');
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = hmacSha256Hex(secret, dataCheckString);
  if (!safeEqual(computed, hash)) throw new Error('INVALID_INIT_DATA');

  const authDate = Number(params.get('auth_date') ?? '0');
  const age = Date.now() / 1000 - authDate;
  if (!authDate || age > maxAgeSeconds || age < -60) {
    throw new Error('EXPIRED_INIT_DATA');
  }

  return Object.fromEntries(params.entries());
}

/** Bale Mini App uses the same HMAC construction as Telegram WebApps. */
export function validateBaleInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86_400,
): Record<string, string> {
  return validateTelegramInitData(initData, botToken, maxAgeSeconds);
}

/** NowPayments IPN: JSON.stringify(body, Object.keys(body).sort()) then HMAC-SHA512 */
export function verifyNowpaymentsIpn(
  body: Record<string, unknown>,
  signature: string,
  ipnSecret: string,
): boolean {
  const payload = JSON.stringify(body, Object.keys(body).sort());
  const computed = hmacSha512Hex(ipnSecret, payload);
  return safeEqual(computed.toLowerCase(), signature.toLowerCase());
}

export function rialToUsd(amountRial: number, usdToIrrRate: number): number {
  if (usdToIrrRate <= 0) throw new Error('INVALID_FX_RATE');
  return Math.round((amountRial / usdToIrrRate) * 100) / 100;
}

export function formatRial(amountRial: number): string {
  return new Intl.NumberFormat('fa-IR-u-nu-latn').format(amountRial);
}

/** Packaging and postage on the original majara.sooremehr.ir checkout. */
export const DEFAULT_SHIPPING_RIAL = 70_000;

export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - '۰'.charCodeAt(0)))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - '٠'.charCodeAt(0)));
}

export function isIranPostalCode(value: string): boolean {
  return /^\d{10}$/.test(toEnglishDigits(value).replace(/\s/g, ''));
}

export function resolveShippingRial(raw?: string | number | null): number {
  const amount = Number(raw);
  return Number.isFinite(amount) && amount >= 0 ? amount : DEFAULT_SHIPPING_RIAL;
}

export function orderAmountRial(
  subtotalRial: number,
  shippingRial = DEFAULT_SHIPPING_RIAL,
): number {
  return subtotalRial + shippingRial;
}
