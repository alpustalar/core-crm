import { ClinicTelegramChannel } from './clinic-telegram-channel.entity';

describe('ClinicTelegramChannel entity', () => {
  const baseProps = {
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    botTokenEnc: 'enc(123:ABC)',
    botUsername: 'klinik_bot',
    webhookSecret: 'secret-hex',
  };

  it('connectBot: BOT_API + ACTIVE kanal üretir, alanları atar', () => {
    const channel = ClinicTelegramChannel.connectBot(baseProps);

    expect(channel.id).toEqual(expect.any(String));
    expect(channel.provider).toBe('BOT_API');
    expect(channel.status).toBe('ACTIVE');
    expect(channel.isActive).toBe(true);
    expect(channel.botTokenEnc).toBe('enc(123:ABC)');
    expect(channel.botUsername).toBe('klinik_bot');
    expect(channel.webhookSecret).toBe('secret-hex');
    expect(channel.phoneNumber).toBeNull();
    expect(channel.mtprotoSessionEnc).toBeNull();
    expect(channel.lastError).toBeNull();
  });

  it('revoke: status REVOKED → isActive false', () => {
    const channel = ClinicTelegramChannel.connectBot(baseProps);
    channel.revoke();
    expect(channel.status).toBe('REVOKED');
    expect(channel.isActive).toBe(false);
  });

  it('markError: status ERROR + lastError set + isActive false', () => {
    const channel = ClinicTelegramChannel.connectBot(baseProps);
    channel.markError('webhook reddedildi');
    expect(channel.status).toBe('ERROR');
    expect(channel.lastError).toBe('webhook reddedildi');
    expect(channel.isActive).toBe(false);
  });

  it('reconnectBot: token/username/secret yeniler, ACTIVE + lastError temizler', () => {
    const channel = ClinicTelegramChannel.connectBot(baseProps);
    channel.markError('eski hata');

    channel.reconnectBot({
      botTokenEnc: 'enc(999:NEW)',
      botUsername: 'yeni_bot',
      webhookSecret: 'yeni-secret',
    });

    expect(channel.status).toBe('ACTIVE');
    expect(channel.isActive).toBe(true);
    expect(channel.botTokenEnc).toBe('enc(999:NEW)');
    expect(channel.botUsername).toBe('yeni_bot');
    expect(channel.webhookSecret).toBe('yeni-secret');
    expect(channel.lastError).toBeNull();
  });

  it('toPersistence: tüm alanları ham kayda döndürür', () => {
    const channel = ClinicTelegramChannel.connectBot(baseProps);
    const raw = channel.toPersistence();
    expect(raw).toMatchObject({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      provider: 'BOT_API',
      status: 'ACTIVE',
      botTokenEnc: 'enc(123:ABC)',
      botUsername: 'klinik_bot',
      webhookSecret: 'secret-hex',
      phoneNumber: null,
      mtprotoSessionEnc: null,
    });
  });
});
