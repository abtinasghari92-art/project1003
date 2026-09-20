import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { CommentCreateDto, CommentVoteDto } from '../admin/admin.dto';
import { CommentsService } from './comments.service';

@Controller()
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get('issues/:issueId/comments')
  list(@Param('issueId') issueId: string) {
    return this.comments.listPublic(issueId);
  }

  @Post('comments')
  @UseGuards(OptionalJwtGuard)
  create(
    @Body() dto: CommentCreateDto,
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
  ) {
    return this.comments.create(dto, user as any, request.ip ?? 'unknown');
  }

  @Post('comments/:id/vote')
  @UseGuards(OptionalJwtGuard)
  vote(
    @Param('id') id: string,
    @Body() dto: CommentVoteDto,
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
  ) {
    return this.comments.vote(id, dto, user as any, request.ip ?? 'unknown');
  }
}
