import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './payments.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('intent')
  intent(@CurrentUser() user: AuthUser, @Body() dto: CreatePaymentIntentDto) {
    return this.payments.createIntent(user.id, dto.orderId, dto.provider, user.channel);
  }

  @Get('zibal/callback')
  async zibalCallback(
    @Query('trackId') trackId: string,
    @Query('success') success: string | undefined,
    @Res() res: Response,
  ) {
    const result = await this.payments.zibalCallback(trackId, success);
    return res.redirect(result.redirect);
  }

  @Post('nowpayments/ipn')
  nowpaymentsIpn(
    @Body() body: Record<string, unknown>,
    @Headers('x-nowpayments-sig') signature: string | undefined,
  ) {
    return this.payments.nowpaymentsIpn(body, signature);
  }
}
