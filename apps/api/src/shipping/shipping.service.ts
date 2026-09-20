import { BadRequestException, Injectable } from '@nestjs/common';
import { DeliveryMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateDeliverySettingsDto } from '../admin/admin.dto';

const SETTINGS_ID = 'global';
const DEFAULTS = {
  postShippingRial: 70_000,
  courierTehranEnabled: false,
  courierTehranRial: 0,
};

export type ShippingOption = {
  id: DeliveryMethod;
  title: string;
  description: string;
  shippingRial: number;
};

function isTehran(province: string) {
  return province.trim().replace(/ي/g, 'ی').replace(/ك/g, 'ک') === 'تهران';
}

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  settings() {
    return this.prisma.deliverySettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...DEFAULTS },
      update: {},
    });
  }

  async options(province: string): Promise<ShippingOption[]> {
    const settings = await this.settings();
    const options: ShippingOption[] = [
      {
        id: DeliveryMethod.POST,
        title: 'ارسال پستی',
        description: 'ارسال به همه شهرهای ایران',
        shippingRial: settings.postShippingRial,
      },
    ];
    if (settings.courierTehranEnabled && isTehran(province)) {
      options.push({
        id: DeliveryMethod.COURIER_TEHRAN,
        title: 'پیک در تهران',
        description: 'تحویل با پیک در محدوده تهران',
        shippingRial: settings.courierTehranRial,
      });
    }
    return options;
  }

  async resolve(province: string, method: DeliveryMethod) {
    const option = (await this.options(province)).find((item) => item.id === method);
    if (!option) {
      throw new BadRequestException(
        method === DeliveryMethod.COURIER_TEHRAN
          ? 'ارسال با پیک فقط برای تهران و هنگام فعال‌بودن این گزینه امکان‌پذیر است'
          : 'روش ارسال نامعتبر است',
      );
    }
    return option;
  }

  async update(dto: UpdateDeliverySettingsDto) {
    const current = await this.settings();
    const next = {
      postShippingRial: dto.postShippingRial ?? current.postShippingRial,
      courierTehranEnabled: dto.courierTehranEnabled ?? current.courierTehranEnabled,
      courierTehranRial: dto.courierTehranRial ?? current.courierTehranRial,
    };
    if (next.courierTehranEnabled && next.courierTehranRial < 0) {
      throw new BadRequestException('هزینه پیک تهران نامعتبر است');
    }
    return this.prisma.deliverySettings.update({ where: { id: SETTINGS_ID }, data: next });
  }
}
