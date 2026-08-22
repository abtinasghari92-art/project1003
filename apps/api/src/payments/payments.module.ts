import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ZibalProvider } from './providers/zibal.provider';
import { NowpaymentsProvider } from './providers/nowpayments.provider';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, ZibalProvider, NowpaymentsProvider],
})
export class PaymentsModule {}
