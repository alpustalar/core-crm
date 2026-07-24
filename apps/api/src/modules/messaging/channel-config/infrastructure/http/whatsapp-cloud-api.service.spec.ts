import { WhatsappCloudApiService } from './whatsapp-cloud-api.service';

// Servis artık ConfigService değil düz WhatsappCloudApiConfig ({ appId, appSecret }) alır.
const testConfig = { appId: 'app-id', appSecret: 'app-secret' };

describe('WhatsappCloudApiService.fetchMedia (proxy indirme)', () => {
  const service = new WhatsappCloudApiService(testConfig);

  afterEach(() => jest.restoreAllMocks());

  it('media id → geçici URL → token ile indirir, içerik+mime döner', async () => {
    const fetchMock = jest
      .fn()
      // 1) media meta
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'https://lookaside.fbsbx.com/abc',
          mime_type: 'image/jpeg',
        }),
      })
      // 2) gerçek dosya
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new TextEncoder().encode('jpegbytes').buffer,
        headers: { get: () => 'image/jpeg' },
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await service.fetchMedia('mid-1', 'tok-abc');

    expect(result?.mimeType).toBe('image/jpeg');
    expect(result?.content.toString()).toBe('jpegbytes');
    // her iki çağrı da Bearer token taşır
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer tok-abc'
    );
    expect(fetchMock.mock.calls[1][0]).toBe('https://lookaside.fbsbx.com/abc');
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe(
      'Bearer tok-abc'
    );
  });

  it('media meta alınamazsa null döner (dosya indirilmez)', async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({ ok: false, status: 404 });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await service.fetchMedia('mid-x', 'tok-abc');
    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('WhatsappCloudApiService.registerPhoneNumber (Cloud API register)', () => {
  const service = new WhatsappCloudApiService(testConfig);

  afterEach(() => jest.restoreAllMocks());

  it('register: phone_number_id/register endpoint + Bearer + PIN gövdesi', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock as unknown as typeof fetch;

    await service.registerPhoneNumber('pn-1', '123456', 'tok-abc');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/pn-1/register');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok-abc');
    const body = JSON.parse(init.body);
    expect(body).toEqual({ messaging_product: 'whatsapp', pin: '123456' });
  });

  it('register başarısızsa fırlatır', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 400, text: async () => 'bad' });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      service.registerPhoneNumber('pn-1', '123456', 'tok-abc')
    ).rejects.toThrow(/register/i);
  });
});

describe('WhatsappCloudApiService.listMessageTemplates', () => {
  const service = new WhatsappCloudApiService(testConfig);

  afterEach(() => jest.restoreAllMocks());

  it('WABA message_templates endpoint → data dizisi döner', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { name: 't1', language: 'tr', status: 'APPROVED', category: 'UTILITY', components: [] },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await service.listMessageTemplates('waba-1', 'tok');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/waba-1/message_templates');
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('t1');
  });

  it('hata dönerse fırlatır', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 400, text: async () => 'bad' });
    global.fetch = fetchMock as unknown as typeof fetch;
    await expect(service.listMessageTemplates('waba-1', 'tok')).rejects.toThrow(
      /Şablon/
    );
  });
});

describe('WhatsappCloudApiService.exchangeForLongLivedToken', () => {
  const service = new WhatsappCloudApiService(testConfig);

  afterEach(() => jest.restoreAllMocks());

  it('fb_exchange_token grant ile uzun-ömürlü token + expiry döner', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'long-token', expires_in: 5184000 }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const before = Date.now();
    const result = await service.exchangeForLongLivedToken('short-token');

    expect(result.accessToken).toBe('long-token');
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('grant_type=fb_exchange_token');
    expect(url).toContain('fb_exchange_token=short-token');
    expect(result.expiresAt!.getTime()).toBeGreaterThan(before);
  });
});
