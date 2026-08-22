import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @IsString()
  issueId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty = 1;
}
