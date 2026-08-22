import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (request.user?.role !== 'ADMIN') {
      throw new ForbiddenException('دسترسی ادمین لازم است');
    }
    return true;
  }
}

export const AdminOnly = () => applyDecorators(UseGuards(JwtAuthGuard, AdminGuard));
