import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminAuthService } from './admin-auth.service';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminCrmService } from './admin-crm.service';
import { AdminController } from './admin.controller';
import { CommentsModule } from '../comments/comments.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { ShippingModule } from '../shipping/shipping.module';

@Module({
  imports: [AuthModule, CommentsModule, PromotionsModule, ShippingModule],
  controllers: [AdminController],
  providers: [AdminAuthService, AdminCrmService, AdminCatalogService],
})
export class AdminModule {}
