import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdatePromotionDto } from '../admin/admin.dto';

const CAMPAIGN_ID = 'global';
const DEFAULTS = {
  active: false,
  code: '',
  discountPercent: 0,
  title: 'هدیه برای شما',
  description: '',
};

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  config() {
    return this.prisma.promotionCampaign.upsert({
      where: { id: CAMPAIGN_ID },
      create: { id: CAMPAIGN_ID, ...DEFAULTS },
      update: {},
    });
  }

  async active() {
    const campaign = await this.prisma.promotionCampaign.findUnique({ where: { id: CAMPAIGN_ID } });
    if (!campaign?.active || !campaign.code || campaign.discountPercent < 1) return null;
    return {
      id: campaign.id,
      code: campaign.code,
      discountPercent: campaign.discountPercent,
      title: campaign.title,
      description: campaign.description,
      updatedAt: campaign.updatedAt,
    };
  }

  async update(dto: UpdatePromotionDto) {
    const current = await this.config();
    const next = {
      active: dto.active ?? current.active,
      code: dto.code === undefined ? current.code : dto.code.trim().toUpperCase(),
      discountPercent: dto.discountPercent ?? current.discountPercent,
      title: dto.title === undefined ? current.title : dto.title.trim(),
      description: dto.description === undefined ? current.description : dto.description.trim(),
    };
    if (next.active && (!next.code || next.discountPercent < 1)) {
      throw new BadRequestException('برای فعال‌سازی، کد و درصد تخفیف معتبر وارد کنید');
    }
    return this.prisma.promotionCampaign.update({ where: { id: CAMPAIGN_ID }, data: next });
  }
}
