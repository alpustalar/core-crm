import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLogService } from '../../../audit-log/audit-log.service';
import { AuditAction } from '../../../audit-log/enums/audit-action.enum';
import { CLINIC_EVENTS } from '@common/constants/events';
import { ClinicSoftDeletedEvent } from '@modules/clinic/domain/events';

@Injectable()
export class ClinicDeletedListener {
  constructor(private auditLogService: AuditLogService) {}

  @OnEvent(CLINIC_EVENTS.SOFT_DELETED)
  async handleOrganizationDeleted(event: ClinicSoftDeletedEvent) {
    await this.auditLogService.log({
      action: AuditAction.CLINIC_SOFT_DELETE,
      source: event.source,
      details: `clinic id: ${event.clinicId}`,
      userId: event.userId,
    });
  }
}
