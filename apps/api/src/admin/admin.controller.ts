import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { AdminOnly } from '../common/guards/admin.guard';
import { AdminAuthService } from './admin-auth.service';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminCrmService } from './admin-crm.service';
import {
  AdminLoginDto,
  AdminOrdersQueryDto,
  CreateCustomerNoteDto,
  CreateIssueDto,
  CreateMagazineDto,
  UpdateIssueDto,
  UpdateMagazineDto,
} from './admin.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly auth: AdminAuthService,
    private readonly crm: AdminCrmService,
    private readonly catalog: AdminCatalogService,
  ) {}

  @Post('auth/login')
  login(@Body() dto: AdminLoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @AdminOnly()
  me(@CurrentUser() admin: AuthUser) {
    return this.auth.me(admin.id);
  }

  @Get('stats')
  @AdminOnly()
  stats() {
    return this.crm.stats();
  }

  @Get('customers')
  @AdminOnly()
  customers(@Query('q') q?: string) {
    return this.crm.listCustomers(q);
  }

  @Get('customers/:id')
  @AdminOnly()
  customer(@Param('id') id: string) {
    return this.crm.getCustomer(id);
  }

  @Post('customers/:id/notes')
  @AdminOnly()
  addNote(
    @Param('id') id: string,
    @CurrentUser() admin: AuthUser,
    @Body() dto: CreateCustomerNoteDto,
  ) {
    return this.crm.addNote(id, admin.id, dto);
  }

  @Get('orders')
  @AdminOnly()
  orders(@Query() query: AdminOrdersQueryDto) {
    return this.crm.listOrders(query);
  }

  @Get('orders/:id')
  @AdminOnly()
  order(@Param('id') id: string) {
    return this.crm.getOrder(id);
  }

  @Get('magazines')
  @AdminOnly()
  magazines() {
    return this.catalog.listMagazines();
  }

  @Post('magazines')
  @AdminOnly()
  createMagazine(@Body() dto: CreateMagazineDto) {
    return this.catalog.createMagazine(dto);
  }

  @Patch('magazines/:id')
  @AdminOnly()
  updateMagazine(@Param('id') id: string, @Body() dto: UpdateMagazineDto) {
    return this.catalog.updateMagazine(id, dto);
  }

  @Delete('magazines/:id')
  @AdminOnly()
  deleteMagazine(@Param('id') id: string) {
    return this.catalog.deleteMagazine(id);
  }

  @Post('issues')
  @AdminOnly()
  createIssue(@Body() dto: CreateIssueDto) {
    return this.catalog.createIssue(dto);
  }

  @Patch('issues/:id')
  @AdminOnly()
  updateIssue(@Param('id') id: string, @Body() dto: UpdateIssueDto) {
    return this.catalog.updateIssue(id, dto);
  }

  @Delete('issues/:id')
  @AdminOnly()
  deleteIssue(@Param('id') id: string) {
    return this.catalog.deleteIssue(id);
  }
}
