import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BaleAuthDto, OtpSendDto, OtpVerifyDto, TelegramAuthDto } from './auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('telegram')
  loginTelegram(@Body() dto: TelegramAuthDto) {
    return this.auth.loginTelegram(dto.initData);
  }

  @Post('bale')
  loginBale(@Body() dto: BaleAuthDto) {
    return this.auth.loginBale(dto.initData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('otp/send')
  sendOtp(@CurrentUser() user: AuthUser, @Body() dto: OtpSendDto) {
    return this.auth.sendOtp(user.id, dto.phone);
  }

  @UseGuards(JwtAuthGuard)
  @Post('otp/verify')
  verifyOtp(@CurrentUser() user: AuthUser, @Body() dto: OtpVerifyDto) {
    return this.auth.verifyOtp(user.id, dto.phone, dto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.getMe(user.id);
  }
}
