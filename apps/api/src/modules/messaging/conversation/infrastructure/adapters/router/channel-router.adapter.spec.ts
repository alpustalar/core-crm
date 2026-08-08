import { MessageChannel, MessageType } from '@shared';
import { ChannelRouterAdapter } from './channel-router.adapter';
import { MetaWhatsappChannelAdapter } from '@modules/messaging/conversation/infrastructure/adapters/meta/meta-whatsapp-channel.adapter';
import { TelegramBotChannelAdapter } from '@modules/messaging/conversation/infrastructure/adapters/telegram/telegram-bot-channel.adapter';
import { InstagramChannelAdapter } from '@modules/messaging/conversation/infrastructure/adapters/instagram/instagram-channel.adapter';
import { SendMessageRequest } from '@modules/messaging/conversation/domain/ports/message-channel.port';

describe('ChannelRouterAdapter', () => {
  const build = () => {
    const whatsapp = {
      send: jest.fn().mockResolvedValue({ externalId: 'wa-1' }),
      markRead: jest.fn().mockResolvedValue(undefined),
    } as unknown as MetaWhatsappChannelAdapter;

    const telegram = {
      send: jest.fn().mockResolvedValue({ externalId: 'tg-1' }),
      markRead: jest.fn().mockResolvedValue(undefined),
    } as unknown as TelegramBotChannelAdapter;

    const instagram = {
      send: jest.fn().mockResolvedValue({ externalId: 'ig-1' }),
      markRead: jest.fn().mockResolvedValue(undefined),
    } as unknown as InstagramChannelAdapter;

    return {
      router: new ChannelRouterAdapter(whatsapp, telegram, instagram),
      whatsapp,
      telegram,
      instagram,
    };
  };

  const request = (channel: MessageChannel): SendMessageRequest => ({
    channel,
    clinicId: 'clinic-1',
    toPhone: 'x',
    type: MessageType.TEXT,
    body: 'hi',
  });

  it('send: WHATSAPP → Meta adapter', async () => {
    const { router, whatsapp, telegram } = build();
    const res = await router.send(request(MessageChannel.WHATSAPP));
    expect(whatsapp.send).toHaveBeenCalled();
    expect(telegram.send).not.toHaveBeenCalled();
    expect(res).toEqual({ externalId: 'wa-1' });
  });

  it('send: TELEGRAM → Telegram adapter', async () => {
    const { router, whatsapp, telegram } = build();
    const res = await router.send(request(MessageChannel.TELEGRAM));
    expect(telegram.send).toHaveBeenCalled();
    expect(whatsapp.send).not.toHaveBeenCalled();
    expect(res).toEqual({ externalId: 'tg-1' });
  });

  it('send: INSTAGRAM → Instagram adapter', async () => {
    const { router, whatsapp, telegram, instagram } = build();
    const res = await router.send(request(MessageChannel.INSTAGRAM));
    expect(instagram.send).toHaveBeenCalled();
    expect(whatsapp.send).not.toHaveBeenCalled();
    expect(telegram.send).not.toHaveBeenCalled();
    expect(res).toEqual({ externalId: 'ig-1' });
  });

  it('markRead: kanala göre doğru adapter + channel iletilir', async () => {
    const { router, whatsapp, telegram } = build();
    await router.markRead(MessageChannel.TELEGRAM, 'clinic-1', 'tg:1:2');
    expect(telegram.markRead).toHaveBeenCalledWith(
      MessageChannel.TELEGRAM,
      'clinic-1',
      'tg:1:2'
    );
    expect(whatsapp.markRead).not.toHaveBeenCalled();
  });
});
