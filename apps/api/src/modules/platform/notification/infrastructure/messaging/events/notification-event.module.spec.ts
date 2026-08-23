import { ConfigService } from '@nestjs/config';
import { opsAlertPortFactory } from './notification-event.module';
import { SlackOpsAlertAdapter } from '@modules/platform/notification/infrastructure/delivery/slack-ops-alert.adapter';
import { LogOpsAlertAdapter } from '@modules/platform/notification/infrastructure/delivery/log-ops-alert.adapter';
import { ENV } from '@common/constants/env.constant';

/**
 * Yanlış dallanma "uyarılar sessizce log'da kalıyor" demek olurdu ve bunu ancak
 * bir olay kaçtığında fark ederdik; seçim bu yüzden testle sabitlenir.
 */
describe('opsAlertPortFactory', () => {
  const slack = {} as SlackOpsAlertAdapter;
  const log = {} as LogOpsAlertAdapter;

  const config = (env: Record<string, string | undefined>) =>
    ({ get: (key: string) => env[key] }) as unknown as ConfigService;

  it('webhook tanımlıysa Slack adaptörü seçilir', () => {
    const port = opsAlertPortFactory(
      config({ [ENV.SLACK_OPS_WEBHOOK_URL]: 'https://hooks.slack.com/x' }),
      slack,
      log
    );

    expect(port).toBe(slack);
  });

  it('yalnız CRITICAL kanalı tanımlıysa da Slack seçilir', () => {
    const port = opsAlertPortFactory(
      config({
        [ENV.SLACK_OPS_WEBHOOK_URL_CRITICAL]: 'https://hooks.slack.com/crit',
      }),
      slack,
      log
    );

    expect(port).toBe(slack);
  });

  it('hiçbir webhook yoksa log adaptörüne düşülür', () => {
    const port = opsAlertPortFactory(config({}), slack, log);

    expect(port).toBe(log);
  });
});
