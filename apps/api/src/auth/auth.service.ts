import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  generateOtpCode,
  hashOtp,
  isIranMobile,
  normalizePhone,
  safeEqual,
  validateBaleInitData,
  validateTelegramInitData,
} from '@majara/utils';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '@majara/types';

interface MiniAppUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async loginTelegram(initData: string) {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) throw new UnauthorizedException('Telegram bot token is not configured');
    const parsed = validateTelegramInitData(initData, token);
    const user = this.parseMiniAppUser(parsed.user);
    const record = await this.upsertTelegramUser(user);
    return this.issueSession(record.id);
  }

  async loginBale(initData: string) {
    const token = this.config.get<string>('BALE_BOT_TOKEN');
    if (!token) throw new UnauthorizedException('Bale bot token is not configured');
    const parsed = validateBaleInitData(initData, token);
    const user = this.parseMiniAppUser(parsed.user);
    const record = await this.upsertBaleUser(user);
    return this.issueSession(record.id);
  }

  async sendOtp(userId: string, rawPhone: string) {
    const phone = normalizePhone(rawPhone);
    if (!isIranMobile(phone)) throw new BadRequestException('شماره موبایل نامعتبر است');

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await this.prisma.otpChallenge.count({
      where: { userId, phone, createdAt: { gte: hourAgo } },
    });
    if (recent >= 5) {
      throw new HttpException('تعداد درخواست کد بیش از حد مجاز است', HttpStatus.TOO_MANY_REQUESTS);
    }

    const last = await this.prisma.otpChallenge.findFirst({
      where: { userId, phone },
      orderBy: { createdAt: 'desc' },
    });
    if (last && Date.now() - last.createdAt.getTime() < 60_000) {
      throw new HttpException('کمی بعد دوباره تلاش کنید', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = generateOtpCode();
    const pepper = this.config.getOrThrow<string>('OTP_PEPPER');
    const ttl = Number(this.config.get('OTP_TTL_SECONDS') ?? 120);

    await this.prisma.otpChallenge.create({
      data: {
        userId,
        phone,
        codeHash: hashOtp(code, pepper),
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });

    await this.dispatchKavenegar(phone, code);
    return { ok: true, ttlSeconds: ttl };
  }

  async verifyOtp(userId: string, rawPhone: string, code: string) {
    const phone = normalizePhone(rawPhone);
    const pepper = this.config.getOrThrow<string>('OTP_PEPPER');
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { userId, phone, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) throw new BadRequestException('کد تایید یافت نشد');
    if (challenge.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('کد تایید منقضی شده است');
    }
    if (challenge.attempts >= 5) {
      throw new HttpException('تعداد تلاش بیش از حد است', HttpStatus.TOO_MANY_REQUESTS);
    }

    const ok = safeEqual(challenge.codeHash, hashOtp(code.trim(), pepper));
    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: {
        attempts: { increment: 1 },
        consumedAt: ok ? new Date() : undefined,
      },
    });
    if (!ok) throw new BadRequestException('کد تایید نادرست است');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { phone },
      include: { telegram: true, bale: true },
    });

    return { ok: true, user: this.toPublicUser(user) };
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { telegram: true, bale: true },
    });
    return this.toPublicUser(user);
  }

  private async upsertTelegramUser(mini: MiniAppUser) {
    const existing = await this.prisma.telegramIdentity.findUnique({
      where: { telegramId: String(mini.id) },
    });
    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.userId },
        data: {
          telegram: {
            update: {
              username: mini.username ?? null,
              firstName: mini.first_name ?? null,
              lastName: mini.last_name ?? null,
            },
          },
        },
      });
    }
    return this.prisma.user.create({
      data: {
        telegram: {
          create: {
            telegramId: String(mini.id),
            username: mini.username ?? null,
            firstName: mini.first_name ?? null,
            lastName: mini.last_name ?? null,
          },
        },
      },
    });
  }

  private async upsertBaleUser(mini: MiniAppUser) {
    const existing = await this.prisma.baleIdentity.findUnique({
      where: { baleId: String(mini.id) },
    });
    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.userId },
        data: {
          bale: {
            update: {
              username: mini.username ?? null,
              firstName: mini.first_name ?? null,
              lastName: mini.last_name ?? null,
            },
          },
        },
      });
    }
    return this.prisma.user.create({
      data: {
        bale: {
          create: {
            baleId: String(mini.id),
            username: mini.username ?? null,
            firstName: mini.first_name ?? null,
            lastName: mini.last_name ?? null,
          },
        },
      },
    });
  }

  private async issueSession(userId: string) {
    const token = await this.jwt.signAsync({ sub: userId });
    const user = await this.getMe(userId);
    return { token, user };
  }

  private parseMiniAppUser(raw?: string): MiniAppUser {
    if (!raw) throw new UnauthorizedException('Mini App user payload is missing');
    try {
      const parsed = JSON.parse(raw) as MiniAppUser;
      if (!parsed?.id) throw new Error('no id');
      return parsed;
    } catch {
      throw new UnauthorizedException('Mini App user payload is invalid');
    }
  }

  private toPublicUser(user: {
    id: string;
    phone: string | null;
    telegram?: {
      telegramId: string;
      username: string | null;
      firstName: string | null;
    } | null;
    bale?: { baleId: string; username: string | null; firstName: string | null } | null;
  }): PublicUser {
    return {
      id: user.id,
      phone: user.phone,
      telegram: user.telegram
        ? {
            telegramId: user.telegram.telegramId,
            username: user.telegram.username,
            firstName: user.telegram.firstName,
          }
        : undefined,
      bale: user.bale
        ? {
            baleId: user.bale.baleId,
            username: user.bale.username,
            firstName: user.bale.firstName,
          }
        : undefined,
    };
  }

  private async dispatchKavenegar(phone: string, code: string) {
    const apiKey = this.config.get<string>('KAVENEGAR_API_KEY');
    const template = this.config.get<string>('KAVENEGAR_OTP_TEMPLATE') ?? 'verify';
    if (!apiKey) {
      if (this.config.get('NODE_ENV') === 'production') {
        throw new BadRequestException('Kavenegar is not configured');
      }
      // Local scaffold: code is stored hashed; log only outside production.
      console.info(`[otp:dev] ${phone} => ${code}`);
      return;
    }

    const url = new URL(`https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`);
    url.searchParams.set('receptor', phone);
    url.searchParams.set('token', code);
    url.searchParams.set('template', template);

    const response = await fetch(url, { method: 'POST' });
    const body = (await response.json()) as { return?: { status?: number; message?: string } };
    if (!response.ok || (body.return?.status && body.return.status >= 400)) {
      throw new BadRequestException(body.return?.message ?? 'ارسال پیامک ناموفق بود');
    }
  }
}
