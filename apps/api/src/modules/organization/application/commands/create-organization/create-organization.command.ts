import { CreateOrganizationDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

import { CreateOrganizationInternalRelationsProps } from '@modules/organization/domain/types/create-organization-internal-relations.props';

export class CreateOrganizationCommand {
  constructor(
    public readonly dto: CreateOrganizationDto,
    public readonly ctx: IGetContext,
    public readonly internalRelations?: CreateOrganizationInternalRelationsProps
  ) {}
}
