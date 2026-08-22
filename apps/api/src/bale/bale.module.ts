import { Module } from '@nestjs/common';
import { BaleController } from './bale.controller';

@Module({
  controllers: [BaleController],
})
export class BaleModule {}
