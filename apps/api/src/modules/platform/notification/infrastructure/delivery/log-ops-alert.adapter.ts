import { Injectable, Logger } from '@nestjs/common';
import {
  OpsAlertInput,
  OpsAlertPort,
} from '@common/observability/ops-alert.port';

/**
 * Geçici adaptör: uyarıyı yapılandırılmış log olarak yazar.
 *
 * Slack adaptörü bağlanana kadar buradadır ve **bilerek kalıcıdır**: Slack
 * yapılandırılmamış bir ortamda (yerel, test) uyarının hiçbir yere gitmemesi
 * yerine log'a düşmesi tercih edilir. Slack geldiğinde bu sınıf silinmez,
 * yalnız port sağlayıcısı değişir.
 */
@Injectable()
export class LogOpsAlertAdapter implements OpsAlertPort {
  private readonly logger = new Logger('OpsAlert');

  alert(input: OpsAlertInput): Promise<void> {
    const line =
      `[${input.severity}] ${input.operation} — ${input.summary}` +
      (input.errorMessage ? ` | hata: ${input.errorMessage}` : '') +
      ` | bağlam: ${JSON.stringify(input.context)}` +
      (input.clinicId ? ` | klinik: ${input.clinicId}` : '');

    if (input.severity === 'CRITICAL') this.logger.error(line);
    else this.logger.warn(line);

    return Promise.resolve();
  }
}
