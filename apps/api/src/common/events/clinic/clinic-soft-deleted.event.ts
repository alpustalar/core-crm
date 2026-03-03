interface IClinicSoftDeletedEvent {
  clinicId: string;
  clinicName: string;
  organizationId?: string;
  userId?: string;
}

export class ClinicSoftDeletedEvent {
  clinicId: string;
  clinicName: string;
  organizationId?: string;
  userId?: string;

  constructor(event: IClinicSoftDeletedEvent) {
    this.clinicId = event.clinicId;
    this.clinicName = event.clinicName;
    this.organizationId = event.organizationId;
    this.userId = event.userId;
  }
}
