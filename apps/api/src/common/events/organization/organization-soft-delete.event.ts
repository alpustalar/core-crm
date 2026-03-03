interface IOrganizationSoftDeleteEvent {
  organizationId: string;
  organizationName: string;
  userId: string;
}

export class OrganizationSoftDeleteEvent {
  readonly organizationId: string;
  readonly organizationName: string;
  readonly userId: string;

  constructor(event: IOrganizationSoftDeleteEvent) {
    this.organizationId = event.organizationId;
    this.organizationName = event.organizationName;
    this.userId = event.userId;
  }
}
