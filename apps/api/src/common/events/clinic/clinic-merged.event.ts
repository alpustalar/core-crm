interface IClinicMergedEvent {
  clinicId: string;
  clinicName: string;
  organizationId?: string;
  userId?: string;
}

export class ClinicMergedEvent {
  organizationId?: string;
  clinicId: string;
  clinicName: string;
  userId?: string;

  constructor(event: IClinicMergedEvent) {
    this.clinicId = event.clinicId;
    this.clinicName = event.clinicName;
    this.organizationId = event.organizationId;
    this.userId = event.userId;
  }
}
