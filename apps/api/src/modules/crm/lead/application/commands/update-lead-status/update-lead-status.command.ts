import { ICommand } from '@nestjs/cqrs';
import { UpdateLeadStatusDto } from '@shared/modules/lead/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class UpdateLeadStatusCommand implements ICommand {
  constructor(
    public readonly leadId: string,
    public readonly dto: UpdateLeadStatusDto,
    public readonly ctx: IGetContext,
  ) {}
}
