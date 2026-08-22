import { NowpaymentsProvider } from './providers/nowpayments.provider';

describe('NowpaymentsProvider.isPaid', () => {
  const provider = Object.create(NowpaymentsProvider.prototype) as NowpaymentsProvider;

  it('fulfills finished and confirmed', () => {
    expect(provider.isPaid('finished')).toBe(true);
    expect(provider.isPaid('confirmed')).toBe(true);
    expect(provider.isPaid('waiting')).toBe(false);
  });
});
