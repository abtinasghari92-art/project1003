import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SaveAddressDto, UpdateAddressDto } from './addresses.dto';

type AddressClient = Prisma.TransactionClient | PrismaService;

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.savedAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async create(userId: string, dto: SaveAddressDto) {
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.savedAddress.count({ where: { userId } });
      const isDefault = dto.isDefault ?? count === 0;
      if (isDefault) await tx.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      const address = await tx.savedAddress.create({
        data: { userId, label: dto.label?.trim() || 'آدرس', ...dto, isDefault },
      });
      if (isDefault) await this.syncDefaultUser(tx, userId, address);
      return address;
    });
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.savedAddress.findFirst({ where: { id, userId } });
      if (!current) throw new NotFoundException('آدرس یافت نشد');
      const isDefault = dto.isDefault ?? current.isDefault;
      if (isDefault) await tx.savedAddress.updateMany({ where: { userId, id: { not: id } }, data: { isDefault: false } });
      const address = await tx.savedAddress.update({
        where: { id },
        data: { ...dto, label: dto.label?.trim() || current.label, isDefault },
      });
      if (isDefault) await this.syncDefaultUser(tx, userId, address);
      return address;
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.savedAddress.findFirst({ where: { id, userId } });
      if (!current) throw new NotFoundException('آدرس یافت نشد');
      await tx.savedAddress.delete({ where: { id } });
      if (current.isDefault) {
        const next = await tx.savedAddress.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' } });
        if (next) {
          await tx.savedAddress.update({ where: { id: next.id }, data: { isDefault: true } });
          await this.syncDefaultUser(tx, userId, next);
        }
      }
      return { ok: true };
    });
  }

  private syncDefaultUser(client: AddressClient, userId: string, address: {
    firstName: string; lastName: string; province: string; city: string; street: string; postalCode: string;
  }) {
    return client.user.update({
      where: { id: userId },
      data: {
        firstName: address.firstName,
        lastName: address.lastName,
        province: address.province,
        city: address.city,
        street: address.street,
        postalCode: address.postalCode,
      },
    });
  }
}
