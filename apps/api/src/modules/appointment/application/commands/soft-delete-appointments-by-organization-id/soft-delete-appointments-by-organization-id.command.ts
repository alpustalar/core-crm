import { IGetContext } from '@common/decorators/get-context.decorator';

export class SoftDeleteAppointmentsByOrganizationIdCommand {
  constructor(
    public readonly organizationId: string,
    public readonly ctx: IGetContext
  ) {}
}
