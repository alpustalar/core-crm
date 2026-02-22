interface IClinicCreatedEvent {
  clinicId: string;
  clinicName: string;
  organizationId?: string;
  userId?: string;
}

export class ClinicCreatedEvent {
  public clinicId: string;
  public clinicName: string;
  public organizationId?: string;
  public userId?: string;

  constructor(event: IClinicCreatedEvent) {
    this.clinicId = event.clinicId;
    this.clinicName = event.clinicName;
    this.organizationId = event.organizationId;
    this.userId = event.userId;
  }
}
