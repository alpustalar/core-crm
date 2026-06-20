import { CreateOrganizationDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateOrganizationInternalRelationsProps } from '@modules/organization/organization/domain/organization.contracts';

export class CreateOrganizationCommand {
  constructor(
    public readonly dto: CreateOrganizationDto,
    public readonly ctx: IGetContext,
    public readonly internalRelations?: CreateOrganizationInternalRelationsProps
  ) {}
}
