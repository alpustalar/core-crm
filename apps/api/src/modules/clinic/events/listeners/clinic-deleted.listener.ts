/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLogService } from '../../../audit-log/audit-log.service';
import { AuditAction, AuditSource } from '../../../audit-log/enums/audit-action.enum';
import { CLINIC_EVENTS } from '../../../../common/constants';
import { ClinicSoftDeletedEvent } from '../../../../common/events/clinic/clinic-soft-deleted.event';

@Injectable()
export class ClinicDeletedListener {
  constructor(private auditLogService: AuditLogService) {}

  @OnEvent(CLINIC_EVENTS.SOFT_DELETED)
  async handleOrganizationDeleted(event: ClinicSoftDeletedEvent) {
    // audit log
    await this.auditLogService.log(
      AuditAction.CLINIC_SOFT_DELETE,
      AuditSource.WEB,
      `organization id: ${event?.organizationId}, clinic id: ${event.clinicName} name: ${event.clinicName}, user id: ${event.userId}`,
    );
  }
}
