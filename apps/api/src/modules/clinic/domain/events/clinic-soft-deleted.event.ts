import { AuditSource } from '@modules/audit-log/enums/audit-action.enum';

interface IClinicSoftDeletedEvent {
  clinicId: string;
  organizationId?: string;
  userId?: string;
  source?: AuditSource;
}

export class ClinicSoftDeletedEvent {
  clinicId: string;
  organizationId?: string;
  userId?: string;
  source?: AuditSource;

  constructor(event: IClinicSoftDeletedEvent) {
    this.clinicId = event.clinicId;
    this.organizationId = event.organizationId;
    this.userId = event.userId;
    this.source = event.source;
  }
}
