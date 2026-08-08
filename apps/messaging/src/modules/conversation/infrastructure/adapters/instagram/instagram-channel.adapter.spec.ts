import { MessageChannel, MessageType } from '@shared';
import { InstagramChannelAdapter } from './instagram-channel.adapter';
import { SendMessageRequest } from '@modules/conversation/domain/ports/message-channel.port';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

describe('InstagramChannelAdapter', () => {
  const credentials = { igUserId: 'ig-123', accessToken: 'tok-abc' };

  const baseRequest: SendMessageRequest = {
    channel: MessageChannel.INSTAGRAM,
    clinicId: 'clinic-1',
    toPhone: 'IGSID-777', // IGSID (alıcı)
    type: MessageType.TEXT,
    body: 'merhaba',
  };

  const build = (creds: { igUserId: string; accessToken: string } | null) => {
    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: creds }),
    } as unknown as TSQueryBus;

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message_id: 'mid-1', recipient_id: 'IGSID-777' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    return { adapter: new InstagramChannelAdapter(queryBus), fetchMock };
  };

  it("TEXT: /{igUserId}/messages endpoint'ine recipient+text POST atar", async () => {
    const { adapter, fetchMock } = build(credentials);

    const result = await adapter.send(baseRequest);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/ig-123/messages');
    expect(init.headers.Authorization).toBe('Bearer tok-abc');
    expect(JSON.parse(init.body)).toEqual({
      recipient: { id: 'IGSID-777' },
      message: { text: 'merhaba' },
    });
    expect(result).toEqual({ externalId: 'mid-1' });
  });

  it('MEDIA: attachment payload ile POST atar (image)', async () => {
    const { adapter, fetchMock } = build(credentials);

    await adapter.send({
      ...baseRequest,
      type: MessageType.MEDIA,
      mediaType: 'image',
      mediaUrl: 'https://x/y.jpg',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.message.attachment).toEqual({
      type: 'image',
      payload: { url: 'https://x/y.jpg', is_reusable: false },
    });
  });

  it('credential yoksa/pasifse hata fırlatır (HTTP yok)', async () => {
    const { adapter, fetchMock } = build(null);
    await expect(adapter.send(baseRequest)).rejects.toThrow(/credential/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Graph hata dönerse fırlatır', async () => {
    const { adapter, fetchMock } = build(credentials);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'rate limit' } }),
    });
    await expect(adapter.send(baseRequest)).rejects.toThrow(/rate limit/);
  });

  it('desteklenmeyen tip (TEMPLATE) → hata', async () => {
    const { adapter } = build(credentials);
    await expect(
      adapter.send({ ...baseRequest, type: MessageType.TEMPLATE })
    ).rejects.toThrow(/desteklenmeyen/i);
  });

  it('markRead: no-op (resolve)', async () => {
    const { adapter } = build(credentials);
    await expect(
      adapter.markRead(MessageChannel.INSTAGRAM, 'clinic-1', 'mid-1')
    ).resolves.toBeUndefined();
  });
});
