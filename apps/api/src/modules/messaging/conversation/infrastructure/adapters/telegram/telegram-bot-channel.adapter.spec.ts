import { MessageChannel, MessageType } from '@prisma/client';
import { TelegramBotChannelAdapter } from './telegram-bot-channel.adapter';
import { SendMessageRequest } from '@modules/messaging/conversation/domain/ports/message-channel.port';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ITelegramBotApi } from '@modules/messaging/channel-config/domain/interfaces/telegram-bot-api.interface';

describe('TelegramBotChannelAdapter', () => {
  const baseRequest: SendMessageRequest = {
    channel: MessageChannel.TELEGRAM,
    clinicId: 'clinic-1',
    toPhone: '987654321', // Telegram chatId
    type: MessageType.TEXT,
    body: 'merhaba',
  };

  const build = (credentials: { botToken: string } | null) => {
    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: credentials }),
    } as unknown as TSQueryBus;

    const botApi = {
      getMe: jest.fn(),
      setWebhook: jest.fn(),
      deleteWebhook: jest.fn(),
      sendMessage: jest.fn().mockResolvedValue({ messageId: '555' }),
      sendMedia: jest.fn().mockResolvedValue({ messageId: '777' }),
    } as unknown as ITelegramBotApi;

    const adapter = new TelegramBotChannelAdapter(queryBus, botApi);
    return { adapter, botApi };
  };

  it('TEXT: sendMessage(chatId, body) çağırır, externalId döner', async () => {
    const { adapter, botApi } = build({ botToken: 'tok-1' });

    const result = await adapter.send(baseRequest);

    expect(botApi.sendMessage).toHaveBeenCalledWith(
      'tok-1',
      '987654321',
      'merhaba'
    );
    expect(result).toEqual({ externalId: '555' });
  });

  it('MEDIA: mediaType→kind eşlemesi ile sendMedia çağırır', async () => {
    const { adapter, botApi } = build({ botToken: 'tok-1' });

    const result = await adapter.send({
      ...baseRequest,
      type: MessageType.MEDIA,
      mediaType: 'image',
      mediaUrl: 'https://x/y.jpg',
      body: 'açıklama',
    });

    expect(botApi.sendMedia).toHaveBeenCalledWith({
      botToken: 'tok-1',
      chatId: '987654321',
      kind: 'photo',
      fileUrl: 'https://x/y.jpg',
      caption: 'açıklama',
    });
    expect(result).toEqual({ externalId: '777' });
  });

  it('credential yoksa/pasifse hata fırlatır', async () => {
    const { adapter } = build(null);
    await expect(adapter.send(baseRequest)).rejects.toThrow(/credential/i);
  });

  it('desteklenmeyen tip (TEMPLATE) → hata fırlatır', async () => {
    const { adapter } = build({ botToken: 'tok-1' });
    await expect(
      adapter.send({ ...baseRequest, type: MessageType.TEMPLATE })
    ).rejects.toThrow(/desteklenmeyen/i);
  });

  it('markRead: no-op (resolve) — Telegram bot read-receipt yok', async () => {
    const { adapter } = build({ botToken: 'tok-1' });
    await expect(
      adapter.markRead(MessageChannel.TELEGRAM, 'clinic-1', 'tg:1:2')
    ).resolves.toBeUndefined();
  });
});
