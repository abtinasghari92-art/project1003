import { hash } from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';

describe('AdminAuthService', () => {
  const prisma = {
    adminUser: {
      findUnique: jest.fn(),
    },
  };
  const jwt = {
    signAsync: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('normalizes the email and issues an ADMIN session after a valid login', async () => {
    const passwordHash = await hash('correct-password', 4);
    prisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@majaraamag.ir',
      name: 'مدیر ماجرا',
      role: 'ADMIN',
      passwordHash,
    });
    jwt.signAsync.mockResolvedValue('admin-session-token');
    const service = new AdminAuthService(prisma as never, jwt as never);

    await expect(
      service.login({ email: 'ADMIN@MAJARAAMAG.IR', password: 'correct-password' }),
    ).resolves.toEqual({
      token: 'admin-session-token',
      admin: {
        id: 'admin-1',
        email: 'admin@majaraamag.ir',
        name: 'مدیر ماجرا',
        role: 'ADMIN',
      },
    });
    expect(prisma.adminUser.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@majaraamag.ir' },
    });
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'admin-1', role: 'ADMIN' });
  });

  it('rejects invalid credentials without issuing a session', async () => {
    prisma.adminUser.findUnique.mockResolvedValue(null);
    const service = new AdminAuthService(prisma as never, jwt as never);

    await expect(
      service.login({ email: 'missing@majaraamag.ir', password: 'incorrect-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
