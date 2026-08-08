import { ClinicInstagramChannel } from './clinic-instagram-channel.entity';

describe('ClinicInstagramChannel entity', () => {
  const baseProps = {
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    igUserId: 'ig-123',
    pageId: 'page-9',
    username: 'klinik',
    accessToken: 'enc(tok)',
  };

  it('connect: aktif kanal üretir, alanları atar', () => {
    const channel = ClinicInstagramChannel.connect(baseProps);

    expect(channel.id).toEqual(expect.any(String));
    expect(channel.igUserId).toBe('ig-123');
    expect(channel.pageId).toBe('page-9');
    expect(channel.username).toBe('klinik');
    expect(channel.accessToken).toBe('enc(tok)');
    expect(channel.isActive).toBe(true);
    expect(channel.lastError).toBeNull();
  });

  it('deactivate: isActive false', () => {
    const channel = ClinicInstagramChannel.connect(baseProps);
    channel.deactivate();
    expect(channel.isActive).toBe(false);
  });

  it('markError: isActive false + lastError set', () => {
    const channel = ClinicInstagramChannel.connect(baseProps);
    channel.markError('token süresi doldu');
    expect(channel.isActive).toBe(false);
    expect(channel.lastError).toBe('token süresi doldu');
  });

  it('reconnect: token/username/page yeniler, aktifleştirir, lastError temizler', () => {
    const channel = ClinicInstagramChannel.connect(baseProps);
    channel.markError('eski');

    channel.reconnect({
      accessToken: 'enc(new)',
      username: 'yeni',
      pageId: 'page-x',
      tokenExpiresAt: null,
    });

    expect(channel.isActive).toBe(true);
    expect(channel.accessToken).toBe('enc(new)');
    expect(channel.username).toBe('yeni');
    expect(channel.pageId).toBe('page-x');
    expect(channel.lastError).toBeNull();
  });

  it('toPersistence: alanları ham kayda döndürür', () => {
    const channel = ClinicInstagramChannel.connect(baseProps);
    expect(channel.toPersistence()).toMatchObject({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      igUserId: 'ig-123',
      pageId: 'page-9',
      username: 'klinik',
      accessToken: 'enc(tok)',
      isActive: true,
    });
  });
});
