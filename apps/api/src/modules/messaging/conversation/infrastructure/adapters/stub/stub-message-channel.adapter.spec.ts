import { MessageChannel, MessageType } from '@shared';
import { StubMessageChannelAdapter } from './stub-message-channel.adapter';
import {
  MessageChannelPort,
  SendMessageRequest,
} from '@modules/messaging/conversation/domain/ports/message-channel.port';

describe('StubMessageChannelAdapter (gerçek adapter takılana kadar fallback)', () => {
  const adapter: MessageChannelPort = new StubMessageChannelAdapter();

  const request: SendMessageRequest = {
    channel: MessageChannel.WHATSAPP,
    clinicId: 'clinic-1',
    toPhone: '+905550001122',
    type: MessageType.TEXT,
    body: 'merhaba',
  };

  it('send → sahte externalId döner, hata FIRLATMAZ', async () => {
    const result = await adapter.send(request);
    expect(result.externalId).toMatch(/^stub-/);
  });

  it('her çağrı benzersiz externalId üretir', async () => {
    const a = await adapter.send(request);
    const b = await adapter.send(request);
    expect(a.externalId).not.toBe(b.externalId);
  });
});
