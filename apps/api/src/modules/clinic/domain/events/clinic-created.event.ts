import { AuditSource } from '@modules/audit-log/enums/audit-action.enum';

interface IClinicCreatedEvent {
  clinicId: string;
  organizationId?: string;
  userId?: string;
  source?: AuditSource;
}

export class ClinicCreatedEvent {
  public clinicId: string;
  public organizationId?: string;
  public userId?: string;
  public source?: AuditSource;

  constructor(event: IClinicCreatedEvent) {
    this.clinicId = event.clinicId;
    this.organizationId = event.organizationId;
    this.userId = event.userId;
    this.source = event.source;
  }
}
