import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import axios from 'axios';
import { ENV } from '@common/constants/env.constant';
import {
  OpsAlertInput,
  OpsAlertPort,
  OpsAlertSeverity,
} from '@common/observability/ops-alert.port';
import { LogOpsAlertAdapter } from '@modules/platform/notification/infrastructure/delivery/log-ops-alert.adapter';

/**
 * Operasyonel uyarıları Slack'e (incoming webhook) gönderir.
 *
 * Üç davranış kuralı, üçü de "uyarı kaybolmasın" ilkesinden türer:
 *
 * 1. **Asla fırlatmaz.** Bu adaptör bir hatayı DUYURMAK için çağrılıyor; kendi
 *    hatasıyla çağıran akışı ikinci kez düşürmesi kabul edilemez.
 * 2. **Slack'e ulaşılamazsa log'a düşer** (`LogOpsAlertAdapter`). Sessizce
 *    yutmak, uyarının hiç üretilmemesinden farksız olurdu.
 * 3. **Tekrarlar bastırılır, susturulmaz.** Aynı `dedupeKey` için pencere
 *    boyunca tek mesaj gider; pencere dolduğunda sorun sürüyorsa yeniden
 *    duyurulur. Kalıcı susturma, çözülmemiş bir arızayı görünmez yapardı.
 */
@Injectable()
export class SlackOpsAlertAdapter implements OpsAlertPort {
  private readonly logger = new Logger(SlackOpsAlertAdapter.name);

  private static readonly TIMEOUT_MS = 4000;
  /** Aynı olayın tekrarları bu süre boyunca kanala taşınmaz. */
  private static readonly DEDUPE_TTL_SECONDS = 10 * 60;
  /** Slack mesajını okunur tutmak için bağlam alanı sınırı. */
  private static readonly MAX_CONTEXT_FIELDS = 8;

  constructor(
    private readonly config: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    private readonly fallback: LogOpsAlertAdapter
  ) {}

  async alert(input: OpsAlertInput): Promise<void> {
    const webhookUrl = this.resolveWebhookUrl(input.severity);

    if (!webhookUrl) {
      await this.fallback.alert(input);
      return;
    }

    if (await this.isSuppressed(input)) return;

    try {
      await axios.post(webhookUrl, this.buildPayload(input), {
        timeout: SlackOpsAlertAdapter.TIMEOUT_MS,
      });
    } catch (error) {
      this.logger.error(
        `Slack uyarısı gönderilemedi (${input.operation}): ${
          error instanceof Error ? error.message : error
        }`
      );
      // Kanal düştüğünde uyarı kaybolmasın.
      await this.fallback.alert(input);
    }
  }

  /**
   * CRITICAL için ayrı bir kanal tanımlıysa oraya, değilse varsayılan kanala.
   * Hiçbiri tanımlı değilse Slack devre dışıdır (yerel/test ortamı).
   */
  private resolveWebhookUrl(severity: OpsAlertSeverity): string | undefined {
    const critical = this.config.get<string>(
      ENV.SLACK_OPS_WEBHOOK_URL_CRITICAL
    );
    const base = this.config.get<string>(ENV.SLACK_OPS_WEBHOOK_URL);

    if (severity === 'CRITICAL' && critical) return critical;

    return base;
  }

  /**
   * Redis hatası bastırma DEĞİL geçirme yönünde çözülür: kopya bir uyarı
   * gürültüdür, kaybolan uyarı arızadır.
   */
  private async isSuppressed(input: OpsAlertInput): Promise<boolean> {
    if (!input.dedupeKey) return false;

    try {
      const stored = await this.redis.set(
        `ops-alert:dedupe:${input.dedupeKey}`,
        '1',
        'EX',
        SlackOpsAlertAdapter.DEDUPE_TTL_SECONDS,
        'NX'
      );

      return stored === null;
    } catch (error) {
      this.logger.warn(
        `Uyarı tekrar kontrolü yapılamadı, mesaj yine de gönderiliyor: ${
          error instanceof Error ? error.message : error
        }`
      );
      return false;
    }
  }

  private buildPayload(input: OpsAlertInput) {
    const icon = input.severity === 'CRITICAL' ? '🚨' : '⚠️';
    const title = `${icon} ${input.severity} — ${input.operation}`;

    const details = [
      input.errorMessage ? `*Hata:* ${input.errorMessage}` : null,
      input.clinicId ? `*Klinik:* ${input.clinicId}` : null,
      ...Object.entries(input.context)
        .slice(0, SlackOpsAlertAdapter.MAX_CONTEXT_FIELDS)
        .map(([key, value]) => `*${key}:* ${value ?? '—'}`),
      `*Zaman:* ${input.occurredAt.toISOString()}`,
    ].filter((line): line is string => line !== null);

    return {
      // Bildirim önizlemesi ve blok desteklemeyen istemciler için düz metin.
      text: `${title} — ${input.summary}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: title, emoji: true },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: input.summary },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: details.join('\n') },
        },
      ],
    };
  }
}
