import { IGetContext } from '@common/decorators';
import { UpdateOrganization } from '@shared/modules/organization/types';

export class UpdateOrganizationInfoCommand {
  constructor(
    public readonly payload: {
      ctx: IGetContext;
      data: UpdateOrganization;
      organizationId: string;
    }
  ) {}
}
