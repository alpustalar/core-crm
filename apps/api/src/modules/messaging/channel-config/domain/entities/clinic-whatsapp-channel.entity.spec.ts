import { ClinicWhatsappChannel } from './clinic-whatsapp-channel.entity';

describe('ClinicWhatsappChannel — token ömrü / reconnect', () => {
  const make = (params: {
    accessToken?: string | null;
    tokenExpiresAt?: Date | null;
    isActive?: boolean;
  }) =>
    ClinicWhatsappChannel.create({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      phoneNumberId: 'pn-1',
      accessToken: 'accessToken' in params ? params.accessToken : 'enc-token',
      tokenExpiresAt: params.tokenExpiresAt ?? null,
      isActive: params.isActive ?? true,
    });

  it('expiry yoksa token süresiz kabul edilir', () => {
    const ch = make({ tokenExpiresAt: null });
    expect(ch.isTokenExpired()).toBe(false);
    expect(ch.needsReauth()).toBe(false);
  });

  it('expiry geçmişse expired + needsReauth', () => {
    const ch = make({ tokenExpiresAt: new Date(Date.now() - 1000) });
    expect(ch.isTokenExpired()).toBe(true);
    expect(ch.needsReauth()).toBe(true);
  });

  it('expiry gelecekteyse expired değil', () => {
    const ch = make({ tokenExpiresAt: new Date(Date.now() + 60_000) });
    expect(ch.isTokenExpired()).toBe(false);
    expect(ch.needsReauth()).toBe(false);
  });

  it('aktif ama token yoksa needsReauth', () => {
    const ch = make({ accessToken: null });
    expect(ch.needsReauth()).toBe(true);
  });

  it('pasif kanal reconnect istemez (token yok olsa bile)', () => {
    const ch = make({ accessToken: null, isActive: false });
    expect(ch.needsReauth()).toBe(false);
  });
});
