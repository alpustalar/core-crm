import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateOrganizationInternalRelationsProps } from '@modules/organization/organization/domain/contracts/organization.contracts';
import { CreateOrganization } from '@shared/modules/organization/types';

export class CreateOrganizationCommand {
  constructor(
    public readonly payload: {
      data: CreateOrganization;
      ctx: IGetContext;
      internalRelations?: CreateOrganizationInternalRelationsProps;
    }
  ) {}
}
