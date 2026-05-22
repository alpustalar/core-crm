import { IGetContext } from '@common/decorators/get-context.decorator';

export class SoftDeleteManyUserByOrganizationIdCommand {
  constructor(
    public readonly organizationId: string,
    public readonly ctx: IGetContext
  ) {}
}
