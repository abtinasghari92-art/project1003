import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminAuthService } from './admin-auth.service';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminCrmService } from './admin-crm.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminAuthService, AdminCrmService, AdminCatalogService],
})
export class AdminModule {}
