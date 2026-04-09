import { AuditSource } from '@modules/audit-log/enums/audit-action.enum';

interface IClinicMergedEvent {
  clinicId: string;
  clinicName: string;
  organizationId?: string;
  userId?: string;
  source?: AuditSource;
}

export class ClinicMergedEvent {
  organizationId?: string;
  clinicId: string;
  userId?: string;
  source?: AuditSource;

  constructor(event: IClinicMergedEvent) {
    this.clinicId = event.clinicId;
    this.organizationId = event.organizationId;
    this.userId = event.userId;
    this.source = event.source;
  }
}
