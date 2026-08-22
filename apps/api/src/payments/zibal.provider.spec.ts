import { ZibalProvider } from './providers/zibal.provider';

describe('ZibalProvider.isPaid', () => {
  const provider = Object.create(ZibalProvider.prototype) as ZibalProvider;

  it('treats 100 and 201 as paid', () => {
    expect(provider.isPaid(100)).toBe(true);
    expect(provider.isPaid(201)).toBe(true);
    expect(provider.isPaid(102)).toBe(false);
  });
});
