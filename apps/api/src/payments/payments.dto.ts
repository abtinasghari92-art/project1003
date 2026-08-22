import { IsIn, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  orderId!: string;

  @IsIn(['ZIBAL', 'NOWPAYMENTS'])
  provider!: 'ZIBAL' | 'NOWPAYMENTS';
}
