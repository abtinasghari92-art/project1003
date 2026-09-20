import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AnalyticsEventDto, AnalyticsQueryDto } from '../admin/admin.dto';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { AdminOnly } from '../common/guards/admin.guard';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { AnalyticsService } from './analytics.service';

@Controller()
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('analytics/events')
  @UseGuards(OptionalJwtGuard)
  record(@Body() dto: AnalyticsEventDto, @CurrentUser() user: AuthUser | null) {
    return this.analytics.record(dto, user?.role === 'user' ? user.id : undefined);
  }

  @Get('admin/analytics/overview')
  @AdminOnly()
  overview(@Query() query: AnalyticsQueryDto) {
    return this.analytics.overview(query);
  }

  @Get('admin/analytics/export.csv')
  @AdminOnly()
  async csv(@Query() query: AnalyticsQueryDto, @Res() response: Response) {
    const csv = await this.analytics.csv(query);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', 'attachment; filename="majara-report.csv"');
    response.send(csv);
  }

  @Post('admin/reports/snapshots')
  @AdminOnly()
  snapshot(@Query() query: AnalyticsQueryDto, @CurrentUser() admin: AuthUser) {
    return this.analytics.createSnapshot(admin.id, query);
  }

  @Get('admin/reports/snapshots')
  @AdminOnly()
  snapshots() {
    return this.analytics.listSnapshots();
  }

  @Get('admin/notifications')
  @AdminOnly()
  notifications(@CurrentUser() admin: AuthUser) {
    return this.analytics.notifications(admin.id);
  }

  @Patch('admin/notifications/:id/read')
  @AdminOnly()
  markRead(@Param('id') id: string, @CurrentUser() admin: AuthUser) {
    return this.analytics.markNotificationRead(id, admin.id);
  }
}
