import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { AddCartItemDto } from './cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  async get(@CurrentUser() user: AuthUser) {
    return this.cart.toDto(await this.cart.getOrCreate(user.id));
  }

  @Post('items')
  async add(@CurrentUser() user: AuthUser, @Body() dto: AddCartItemDto) {
    return this.cart.toDto(await this.cart.addItem(user.id, dto.issueId, dto.qty));
  }

  @Delete('items/:issueId')
  async remove(@CurrentUser() user: AuthUser, @Param('issueId') issueId: string) {
    return this.cart.toDto(await this.cart.removeItem(user.id, issueId));
  }
}
