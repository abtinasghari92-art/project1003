import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsObject,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { OrderStatus, PaymentProvider } from '@prisma/client';

export class AdminLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class CreateCustomerNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}

export class AdminOrdersQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;
}

export class CreateMagazineDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;
}

export class UpdateMagazineDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;
}

export class CreateIssueDto {
  @IsString()
  magazineId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  number!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceRial!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  originalPriceRial?: number;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  pdfKey?: string;
}

export class UpdateIssueDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  number?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceRial?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  originalPriceRial?: number | null;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  pdfKey?: string;
}

export class AdminCommentsQueryDto {
  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  issueId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stars?: number;

  @IsOptional()
  @IsString()
  q?: string;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stars?: number;
}

export class CommentReplyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}

export class BulkModerateCommentsDto {
  @IsString({ each: true })
  ids!: string[];

  @IsEnum(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';
}

export class UpdatePromotionDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class UpdateDeliverySettingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  postShippingRial?: number;

  @IsOptional()
  @IsBoolean()
  courierTehranEnabled?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  courierTehranRial?: number;
}

export class CommentCreateDto {
  @IsString()
  issueId!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  guestName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  body!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  stars!: number;
}

export class CommentVoteDto {
  @IsIn(['UP', 'DOWN'])
  value!: 'UP' | 'DOWN';

  @IsString()
  @MinLength(8)
  clientKey!: string;
}

export class AnalyticsEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  eventId!: string;

  @IsEnum(['TELEGRAM', 'BALE'])
  channel!: 'TELEGRAM' | 'BALE';

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(120)
  sessionId!: string;

  @IsOptional()
  @IsString()
  issueId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  path!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string | number | boolean | null>;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(['TELEGRAM', 'BALE'])
  channel?: 'TELEGRAM' | 'BALE';
}
