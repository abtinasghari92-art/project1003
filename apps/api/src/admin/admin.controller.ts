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
  AdminCommentsQueryDto,
  BulkModerateCommentsDto,
  CommentReplyDto,
  UpdateCommentDto,
  UpdatePromotionDto,
  UpdateDeliverySettingsDto,
} from './admin.dto';
import { CommentStatus } from '@prisma/client';
import { CommentsService } from '../comments/comments.service';
import { PromotionsService } from '../promotions/promotions.service';
import { ShippingService } from '../shipping/shipping.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly auth: AdminAuthService,
    private readonly crm: AdminCrmService,
    private readonly catalog: AdminCatalogService,
    private readonly comments: CommentsService,
    private readonly promotions: PromotionsService,
    private readonly shipping: ShippingService,
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

  @Get('audit-logs')
  @AdminOnly()
  auditLogs() {
    return this.crm.listAuditLogs();
  }

  @Get('comments')
  @AdminOnly()
  commentsList(@Query() query: AdminCommentsQueryDto) {
    return this.comments.listAdmin(query);
  }

  @Patch('comments/:id/status')
  @AdminOnly()
  moderateComment(@Param('id') id: string, @Query('status') status: 'APPROVED' | 'REJECTED', @CurrentUser() admin: AuthUser) {
    return this.comments.moderate(id, status as CommentStatus, admin.id);
  }

  @Post('comments/bulk')
  @AdminOnly()
  bulkModerate(@Body() dto: BulkModerateCommentsDto, @CurrentUser() admin: AuthUser) {
    return this.comments.bulkModerate(dto.ids, dto.status as CommentStatus, admin.id);
  }

  @Patch('comments/:id')
  @AdminOnly()
  editComment(@Param('id') id: string, @Body() dto: UpdateCommentDto, @CurrentUser() admin: AuthUser) {
    return this.comments.update(id, dto, admin.id);
  }

  @Post('comments/:id/reply')
  @AdminOnly()
  replyComment(@Param('id') id: string, @Body() dto: CommentReplyDto, @CurrentUser() admin: AuthUser) {
    return this.comments.reply(id, dto, admin.id);
  }

  @Delete('comments/:id')
  @AdminOnly()
  deleteComment(@Param('id') id: string, @CurrentUser() admin: AuthUser) {
    return this.comments.remove(id, admin.id);
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

  @Get('promotion')
  @AdminOnly()
  promotion() {
    return this.promotions.config();
  }

  @Patch('promotion')
  @AdminOnly()
  updatePromotion(@Body() dto: UpdatePromotionDto) {
    return this.promotions.update(dto);
  }

  @Get('delivery-settings')
  @AdminOnly()
  deliverySettings() {
    return this.shipping.settings();
  }

  @Patch('delivery-settings')
  @AdminOnly()
  updateDeliverySettings(@Body() dto: UpdateDeliverySettingsDto) {
    return this.shipping.update(dto);
  }
}
