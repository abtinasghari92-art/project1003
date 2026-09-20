import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('does not create a payable order when the cart is empty', async () => {
    const prisma = {
      order: { create: jest.fn() },
    };
    const cart = {
      getOrCreate: jest.fn().mockResolvedValue({ id: 'cart-1', items: [] }),
    };
    const config = { get: jest.fn() };
    const service = new OrdersService(prisma as never, cart as never, config as never);

    await expect(
      service.checkout('user-1', {
        firstName: 'علی',
        lastName: 'رضایی',
        province: 'تهران',
        city: 'تهران',
        street: 'خیابان آزادی، پلاک ۱',
        postalCode: '1234567890',
        phone: '09120000000',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.order.create).not.toHaveBeenCalled();
  });
});
