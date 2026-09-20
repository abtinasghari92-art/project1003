import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ShippingQuoteDto } from './shipping.dto';
import { ShippingService } from './shipping.service';

@Controller('shipping')
@UseGuards(JwtAuthGuard)
export class ShippingController {
  constructor(private readonly shipping: ShippingService) {}

  @Post('quote')
  quote(@Body() dto: ShippingQuoteDto) {
    return this.shipping.options(dto.province);
  }
}
