import { Controller, Get } from '@nestjs/common';
import { PromotionsService } from './promotions.service';

@Controller('promotion')
export class PromotionsController {
  constructor(private readonly promotions: PromotionsService) {}

  @Get('active')
  active() {
    return this.promotions.active();
  }
}
