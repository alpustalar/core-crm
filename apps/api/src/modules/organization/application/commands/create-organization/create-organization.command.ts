import { CreateOrganizationDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CreateOrganizationCommand {
  constructor(
    public readonly dto: CreateOrganizationDto,
    public readonly context: IGetContext
  ) {}
}
