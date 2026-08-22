import { IsString, MinLength } from 'class-validator';

export class TelegramAuthDto {
  @IsString()
  @MinLength(10)
  initData!: string;
}

export class BaleAuthDto {
  @IsString()
  @MinLength(10)
  initData!: string;
}

export class OtpSendDto {
  @IsString()
  phone!: string;
}

export class OtpVerifyDto {
  @IsString()
  phone!: string;

  @IsString()
  @MinLength(4)
  code!: string;
}
