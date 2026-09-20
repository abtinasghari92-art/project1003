import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ShippingModule } from '../shipping/shipping.module';

@Module({
  imports: [CartModule, ShippingModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
