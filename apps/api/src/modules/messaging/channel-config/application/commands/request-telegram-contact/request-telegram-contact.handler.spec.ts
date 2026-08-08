import { RequestTelegramContactHandler } from './request-telegram-contact.handler';
import { RequestTelegramContactCommand } from './request-telegram-contact.command';
import { ClinicTelegramChannel } from '@modules/messaging/channel-config/domain/entities/clinic-telegram-channel.entity';
import { IClinicTelegramChannelCommandRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { ITelegramBotApi } from '@modules/messaging/channel-config/domain/interfaces/telegram-bot-api.interface';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';

describe('RequestTelegramContactHandler', () => {
  const activeChannel = () =>
    ClinicTelegramChannel.connectBot({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      botTokenEnc: 'enc(tok)',
      botUsername: 'bot',
      webhookSecret: 's',
    });

  const build = (channel: ClinicTelegramChannel | null) => {
    const channelCommandRepo = {
      findByClinicId: jest.fn().mockResolvedValue(channel),
    } as unknown as IClinicTelegramChannelCommandRepository;

    const botApi = {
      getMe: jest.fn(),
      setWebhook: jest.fn(),
      deleteWebhook: jest.fn(),
      sendMessage: jest.fn(),
      sendMedia: jest.fn(),
      sendContactRequest: jest.fn().mockResolvedValue(undefined),
    } as unknown as ITelegramBotApi;

    const cipher = {
      decrypt: jest.fn((t: string) => t.replace(/^enc\((.*)\)$/, '$1')),
    } as unknown as TokenCipherService;

    const handler = new RequestTelegramContactHandler(
      channelCommandRepo,
      botApi,
      cipher
    );
    return { handler, botApi, cipher };
  };

  it('aktif kanal → decrypt token ile request_contact istemi gönderir', async () => {
    const { handler, botApi } = build(activeChannel());

    await handler.execute(new RequestTelegramContactCommand('clinic-1', '555'));

    expect(botApi.sendContactRequest).toHaveBeenCalledWith(
      'tok',
      '555',
      expect.any(String),
      expect.any(String)
    );
  });

  it('kanal yok → no-op (istem gönderilmez)', async () => {
    const { handler, botApi } = build(null);
    await handler.execute(new RequestTelegramContactCommand('clinic-1', '555'));
    expect(botApi.sendContactRequest).not.toHaveBeenCalled();
  });

  it('kanal pasif (revoked) → no-op', async () => {
    const channel = activeChannel();
    channel.revoke();
    const { handler, botApi } = build(channel);
    await handler.execute(new RequestTelegramContactCommand('clinic-1', '555'));
    expect(botApi.sendContactRequest).not.toHaveBeenCalled();
  });

  it('gönderim hatası yutulur (best-effort, throw etmez)', async () => {
    const { handler, botApi } = build(activeChannel());
    (botApi.sendContactRequest as jest.Mock).mockRejectedValueOnce(
      new Error('telegram down')
    );
    await expect(
      handler.execute(new RequestTelegramContactCommand('clinic-1', '555'))
    ).resolves.toBeUndefined();
  });
});
