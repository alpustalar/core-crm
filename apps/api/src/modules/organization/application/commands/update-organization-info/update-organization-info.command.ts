import { UpdateOrganizationDto } from '@shared';
import { IGetContext } from '@common/decorators';

export class UpdateOrganizationInfoCommand {
  constructor(
    public readonly ctx: IGetContext,
    public readonly dto: UpdateOrganizationDto,
    public readonly organizationId?: string
  ) {}
}
