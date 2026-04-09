import { Injectable } from '@nestjs/common';
import { ClinicCreatedEvent } from '@modules/clinic/domain/events';
import { OnEvent } from '@nestjs/event-emitter';
import { CLINIC_EVENTS } from '@common/constants/events';
import { AuditLogService } from '../../../audit-log/audit-log.service';
import { AuditAction } from '../../../audit-log/enums/audit-action.enum';

@Injectable()
export class ClinicCreatedListener {
  constructor(private auditLogService: AuditLogService) {}

  @OnEvent(CLINIC_EVENTS.CREATED)
  async handleClinicCreated(event: ClinicCreatedEvent) {
    await this.auditLogService.log({
      action: AuditAction.CLINIC_CREATE,
      source: event.source,
      details: `clinic id: ${event.clinicId}, organization id: ${event.organizationId}`,
      userId: event.userId,
    });

    // İşlemler:
    // - Welcome email gönder
    // - Slack bildirimi
    // - Analytics'e kaydet
    // - Default settings oluştur
    // - İlk treatment'ları ekle
  }
}
