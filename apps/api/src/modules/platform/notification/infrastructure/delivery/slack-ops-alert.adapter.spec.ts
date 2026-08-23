import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SlackOpsAlertAdapter } from './slack-ops-alert.adapter';
import { LogOpsAlertAdapter } from './log-ops-alert.adapter';
import { ENV } from '@common/constants/env.constant';
import type { OpsAlertInput } from '@common/observability/ops-alert.port';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const WEBHOOK = 'https://hooks.slack.com/services/default';
const WEBHOOK_CRITICAL = 'https://hooks.slack.com/services/critical';

/**
 * Bu adaptör bir hatayı DUYURMAK için çağrılıyor; testler üç sözü sabitler:
 * fırlatmaz, kanal düşerse uyarıyı log'a düşürür, tekrarları bastırır ama
 * kalıcı olarak susturmaz.
 */
describe('SlackOpsAlertAdapter', () => {
  const input = (over: Partial<OpsAlertInput> = {}): OpsAlertInput => ({
    operation: 'finance.ledger.create',
    severity: 'WARNING',
    summary: 'Defter kaydı düşmedi',
    errorMessage: 'connection reset',
    context: { paymentId: 'pay-1' },
    clinicId: 'clinic-1',
    dedupeKey: null,
    occurredAt: new Date('2026-08-23T10:00:00.000Z'),
    ...over,
  });

  const build = (
    env: Record<string, string | undefined> = {
      [ENV.SLACK_OPS_WEBHOOK_URL]: WEBHOOK,
    },
    redisSet: jest.Mock = jest.fn().mockResolvedValue('OK')
  ) => {
    const config = {
      get: jest.fn((key: string) => env[key]),
    } as unknown as ConfigService;

    const fallback = { alert: jest.fn().mockResolvedValue(undefined) };

    const adapter = new SlackOpsAlertAdapter(
      config,
      { set: redisSet } as unknown as Redis,
      fallback as unknown as LogOpsAlertAdapter
    );

    return { adapter, fallback, redisSet };
  };

  beforeEach(() => jest.clearAllMocks());

  it('uyarıyı webhook’a gönderir; özet ve bağlam mesajda taşınır', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const { adapter } = build();

    await adapter.alert(input());

    const [url, payload] = mockedAxios.post.mock.calls[0];
    expect(url).toBe(WEBHOOK);
    expect(payload).toMatchObject({
      text: expect.stringContaining('finance.ledger.create'),
    });
    expect(JSON.stringify(payload)).toContain('pay-1');
    expect(JSON.stringify(payload)).toContain('connection reset');
  });

  it('CRITICAL ayrı kanal tanımlıysa oraya gider', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const { adapter } = build({
      [ENV.SLACK_OPS_WEBHOOK_URL]: WEBHOOK,
      [ENV.SLACK_OPS_WEBHOOK_URL_CRITICAL]: WEBHOOK_CRITICAL,
    });

    await adapter.alert(input({ severity: 'CRITICAL' }));

    expect(mockedAxios.post.mock.calls[0][0]).toBe(WEBHOOK_CRITICAL);
  });

  it('CRITICAL kanalı yoksa varsayılan kanala düşer', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const { adapter } = build();

    await adapter.alert(input({ severity: 'CRITICAL' }));

    expect(mockedAxios.post.mock.calls[0][0]).toBe(WEBHOOK);
  });

  it('aynı dedupeKey pencere içinde ikinci kez gönderilmez', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    // İlk çağrı anahtarı yazar (OK), ikincisi NX'e takılır (null).
    const redisSet = jest
      .fn()
      .mockResolvedValueOnce('OK')
      .mockResolvedValueOnce(null);
    const { adapter } = build(
      { [ENV.SLACK_OPS_WEBHOOK_URL]: WEBHOOK },
      redisSet
    );

    await adapter.alert(input({ dedupeKey: 'listener-failed:foo' }));
    await adapter.alert(input({ dedupeKey: 'listener-failed:foo' }));

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(redisSet).toHaveBeenCalledWith(
      'ops-alert:dedupe:listener-failed:foo',
      '1',
      'EX',
      600,
      'NX'
    );
  });

  it('dedupeKey yoksa tekrar kontrolü yapılmaz', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const { adapter, redisSet } = build();

    await adapter.alert(input({ dedupeKey: null }));
    await adapter.alert(input({ dedupeKey: null }));

    expect(redisSet).not.toHaveBeenCalled();
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  it('Redis düşerse uyarı bastırılmaz — kopya, kayıptan iyidir', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const redisSet = jest.fn().mockRejectedValue(new Error('redis down'));
    const { adapter } = build(
      { [ENV.SLACK_OPS_WEBHOOK_URL]: WEBHOOK },
      redisSet
    );

    await adapter.alert(input({ dedupeKey: 'x' }));

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('Slack erişilemezse fırlatmaz, uyarıyı log adaptörüne düşürür', async () => {
    mockedAxios.post.mockRejectedValue(new Error('timeout'));
    const { adapter, fallback } = build();

    await expect(adapter.alert(input())).resolves.toBeUndefined();
    expect(fallback.alert).toHaveBeenCalledTimes(1);
  });

  it('webhook tanımlı değilse doğrudan log adaptörü kullanılır', async () => {
    const { adapter, fallback } = build({});

    await adapter.alert(input());

    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(fallback.alert).toHaveBeenCalledTimes(1);
  });
});
