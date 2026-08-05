import { ConnectClinicTelegramBotChannelHandler } from './connect-clinic-telegram-bot-channel.handler';
import { ConnectClinicTelegramBotChannelCommand } from './connect-clinic-telegram-bot-channel.command';
import { ClinicTelegramChannel } from '@modules/messaging/channel-config/domain/entities/clinic-telegram-channel.entity';
import { IClinicTelegramChannelCommandRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { ITelegramBotApi } from '@modules/messaging/channel-config/domain/interfaces/telegram-bot-api.interface';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ConfigService } from '@nestjs/config';

describe('ConnectClinicTelegramBotChannelHandler (self-service Bot API)', () => {
  const ctx = { actor: { userId: 'u1', organizationId: 'org-1' } } as never;

  const build = () => {
    let saved: ClinicTelegramChannel | undefined;

    const botApi = {
      getMe: jest.fn().mockResolvedValue({
        id: 42,
        username: 'klinik_bot',
        firstName: 'Klinik',
      }),
      setWebhook: jest.fn().mockResolvedValue(undefined),
      deleteWebhook: jest.fn().mockResolvedValue(undefined),
      sendMessage: jest.fn(),
      sendMedia: jest.fn(),
    } as unknown as ITelegramBotApi;

    const channelCommandRepo = {
      upsertByClinicAndProvider: jest.fn(async (c: ClinicTelegramChannel) => {
        saved = c;
        return c;
      }),
    } as unknown as IClinicTelegramChannelCommandRepository;

    const cipher = {
      encrypt: jest.fn((t: string) => `enc(${t})`),
    } as unknown as TokenCipherService;

    const configService = {
      getOrThrow: jest.fn(() => 'https://api.example.com'),
    } as unknown as ConfigService;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const handler = new ConnectClinicTelegramBotChannelHandler(
      botApi,
      channelCommandRepo,
      cipher,
      configService,
      txManager
    );
    return { handler, botApi, cipher, getSaved: () => saved };
  };

  it('getMe doğrular, klinik bazlı webhook kurar, şifreli token ile ACTIVE kaydeder', async () => {
    const { handler, botApi, cipher, getSaved } = build();

    const id = await handler.execute(
      new ConnectClinicTelegramBotChannelCommand(
        'clinic-1',
        { botToken: '123:ABC' },
        ctx
      )
    );

    expect(botApi.getMe).toHaveBeenCalledWith('123:ABC');

    // Webhook URL'i global prefix + messaging yolu + clinicId içerir; secret üretilir.
    const [url, secret] = (botApi.setWebhook as jest.Mock).mock.calls[0].slice(
      1
    );
    expect(url).toBe(
      'https://api.example.com/api/v1/messaging/telegram/bot/clinic-1'
    );
    expect(secret).toEqual(expect.any(String));
    expect(secret.length).toBeGreaterThan(0);

    expect(cipher.encrypt).toHaveBeenCalledWith('123:ABC');

    const channel = getSaved()!;
    expect(channel.id).toBe(id);
    expect(channel.provider).toBe('BOT_API');
    expect(channel.isActive).toBe(true);
    expect(channel.botTokenEnc).toBe('enc(123:ABC)');
    expect(channel.botUsername).toBe('klinik_bot');
    expect(channel.webhookSecret).toBe(secret);
  });

  it('geçersiz token (getMe hata) → webhook kurulmaz, kanal kaydedilmez', async () => {
    const { handler, botApi, getSaved } = build();
    (botApi.getMe as jest.Mock).mockRejectedValueOnce(
      new Error('Telegram getMe hatası: Unauthorized')
    );

    await expect(
      handler.execute(
        new ConnectClinicTelegramBotChannelCommand(
          'clinic-1',
          { botToken: 'bad' },
          ctx
        )
      )
    ).rejects.toThrow(/getMe/);

    expect(botApi.setWebhook).not.toHaveBeenCalled();
    expect(getSaved()).toBeUndefined();
  });
});
