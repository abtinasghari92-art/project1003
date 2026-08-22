import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminLoginDto } from './admin.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!admin) throw new UnauthorizedException('ایمیل یا رمز نادرست است');

    const ok = await compare(dto.password, admin.passwordHash);
    if (!ok) throw new UnauthorizedException('ایمیل یا رمز نادرست است');

    const token = await this.jwt.signAsync({ sub: admin.id, role: 'ADMIN' });
    return { token, admin: this.toPublic(admin) };
  }

  async me(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException('ادمین یافت نشد');
    return this.toPublic(admin);
  }

  private toPublic(admin: { id: string; email: string; name: string; role: 'ADMIN' }) {
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  }
}
