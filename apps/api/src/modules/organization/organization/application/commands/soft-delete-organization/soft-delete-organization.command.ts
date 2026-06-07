import { IGetContext } from '@common/decorators';

export class SoftDeleteOrganizationCommand {
  constructor(
    public readonly organizationId: string,
    public readonly ctx: IGetContext
  ) {}
}
