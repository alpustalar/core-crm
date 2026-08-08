import { MessageChannel, MessageType } from '@shared';
import { MetaWhatsappChannelAdapter } from './meta-whatsapp-channel.adapter';
import { SendMessageRequest } from '@modules/conversation/domain/ports/message-channel.port';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

describe('MetaWhatsappChannelAdapter (gerçek WhatsApp Cloud API gönderim)', () => {
  const credentials = {
    phoneNumberId: 'pn-123',
    accessToken: 'tok-abc',
    tokenExpiresAt: null,
  };

  const build = (params: {
    credentials?: {
      phoneNumberId: string;
      accessToken: string;
      tokenExpiresAt?: Date | null;
    } | null;
    fetchImpl?: jest.Mock;
  }) => {
    const queryBus = {
      execute: jest
        .fn()
        .mockResolvedValue({ data: params.credentials ?? null }),
    } as unknown as TSQueryBus;

    const fetchMock =
      params.fetchImpl ??
      jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ messages: [{ id: 'wamid.sent.1' }] }),
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    return { adapter: new MetaWhatsappChannelAdapter(queryBus), fetchMock };
  };

  const textRequest: SendMessageRequest = {
    channel: MessageChannel.WHATSAPP,
    clinicId: 'clinic-1',
    toPhone: '+905550001122',
    type: MessageType.TEXT,
    body: 'merhaba',
  };

  it('TEXT gönderimi: doğru endpoint + Bearer + text gövdesi, externalId döner', async () => {
    const { adapter, fetchMock } = build({ credentials });

    const result = await adapter.send(textRequest);

    expect(result.externalId).toBe('wamid.sent.1');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/pn-123/messages');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok-abc');
    const sentBody = JSON.parse(init.body);
    expect(sentBody.type).toBe('text');
    expect(sentBody.to).toBe('+905550001122');
    expect(sentBody.text.body).toBe('merhaba');
  });

  it('credential yoksa hata fırlatır (HTTP çağrısı yapılmaz)', async () => {
    const { adapter, fetchMock } = build({ credentials: null });
    await expect(adapter.send(textRequest)).rejects.toThrow(/credential/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('token süresi dolmuşsa reconnect hatası fırlatır (HTTP çağrısı yapılmaz)', async () => {
    const { adapter, fetchMock } = build({
      credentials: {
        ...credentials,
        tokenExpiresAt: new Date(Date.now() - 60_000),
      },
    });
    await expect(adapter.send(textRequest)).rejects.toThrow(/reconnect/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Graph API hata dönerse fırlatır', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Invalid phone number' } }),
    });
    const { adapter } = build({ credentials, fetchImpl });
    await expect(adapter.send(textRequest)).rejects.toThrow(
      /Invalid phone number/
    );
  });

  it('TEMPLATE gönderimi: template payload + body component kurar', async () => {
    const { adapter, fetchMock } = build({ credentials });

    const result = await adapter.send({
      channel: MessageChannel.WHATSAPP,
      clinicId: 'clinic-1',
      toPhone: '+905550001122',
      type: MessageType.TEMPLATE,
      template: {
        name: 'randevu_hatirlatma',
        language: 'tr',
        bodyParams: ['Ada', '14:00'],
      },
    });

    expect(result.externalId).toBe('wamid.sent.1');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.type).toBe('template');
    expect(body.template.name).toBe('randevu_hatirlatma');
    expect(body.template.language.code).toBe('tr');
    expect(body.template.components[0].parameters).toEqual([
      { type: 'text', text: 'Ada' },
      { type: 'text', text: '14:00' },
    ]);
  });

  it('TEMPLATE: header media + body + URL buton bilesenleri kurar', async () => {
    const { adapter, fetchMock } = build({ credentials });

    await adapter.send({
      channel: MessageChannel.WHATSAPP,
      clinicId: 'clinic-1',
      toPhone: '+905550001122',
      type: MessageType.TEMPLATE,
      template: {
        name: 'kampanya',
        language: 'tr',
        bodyParams: ['Ada'],
        headerMediaUrl: 'https://cdn/x.jpg',
        headerMediaType: 'image',
        urlButtonParams: ['promo123'],
      },
    });

    const components = JSON.parse(fetchMock.mock.calls[0][1].body).template
      .components as Array<Record<string, unknown>>;
    const header = components.find((c) => c.type === 'header')!;
    expect(header.parameters).toEqual([
      { type: 'image', image: { link: 'https://cdn/x.jpg' } },
    ]);
    const body = components.find((c) => c.type === 'body')!;
    expect(body.parameters).toEqual([{ type: 'text', text: 'Ada' }]);
    const button = components.find((c) => c.type === 'button')!;
    expect(button).toMatchObject({
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: 'promo123' }],
    });
  });

  it('TEMPLATE template alanı yoksa fırlatır', async () => {
    const { adapter } = build({ credentials });
    await expect(
      adapter.send({ ...textRequest, type: MessageType.TEMPLATE })
    ).rejects.toThrow(/template/i);
  });

  it('markRead: status:read payload + message_id ile POST atar', async () => {
    const { adapter, fetchMock } = build({ credentials });

    await adapter.markRead(MessageChannel.WHATSAPP, 'clinic-1', 'wamid.in.1');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/pn-123/messages');
    expect(init.headers.Authorization).toBe('Bearer tok-abc');
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: 'wamid.in.1',
    });
  });

  it('markRead: credential yoksa sessizce geçer (HTTP yok)', async () => {
    const { adapter, fetchMock } = build({ credentials: null });
    await expect(
      adapter.markRead(MessageChannel.WHATSAPP, 'clinic-1', 'wamid.in.1')
    ).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
