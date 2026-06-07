import { Injectable } from '@nestjs/common';
import { ClinicCreatedEvent } from '@modules/organization/clinic/domain/events';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLogService } from '@modules/platform/audit-log/audit-log.service';

@Injectable()
export class ClinicCreatedListener {
  constructor(private auditLogService: AuditLogService) {}

  @OnEvent(ClinicCreatedEvent.NAME, { async: true })
  async handleClinicCreated(event: ClinicCreatedEvent) {
    // İşlemler:
    // - Welcome email gönder
    // - Slack bildirimi
    // - Analytics'e kaydet
    // - Default settings oluştur
    // - İlk treatment'ları ekle
  }
}
