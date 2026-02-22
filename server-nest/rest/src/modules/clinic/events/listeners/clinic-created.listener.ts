/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { ClinicCreatedEvent } from '@common/events';
import { OnEvent } from '@nestjs/event-emitter';
import { CLINIC_EVENTS } from '@common/constants';
import { AuditLogService } from '../../../audit-log/audit-log.service';
import {
  AuditAction,
  AuditSource,
} from '../../../audit-log/enums/audit-action.enum';

@Injectable()
export class ClinicCreatedListener {
  constructor(private auditLogService: AuditLogService) {}

  @OnEvent(CLINIC_EVENTS.CREATED)
  async handleClinicCreated(event: ClinicCreatedEvent) {
    await this.auditLogService.log(
      AuditAction.CLINIC_CREATE,
      AuditSource.WEB,
      `clinic id: ${event.clinicId}, clinic name: ${event.clinicName}, organization id: ${event.organizationId}`,
      event.userId,
    );

    // İşlemler:
    // - Welcome email gönder
    // - Slack bildirimi
    // - Analytics'e kaydet
    // - Default settings oluştur
    // - İlk treatment'ları ekle
  }
}
