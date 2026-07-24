import { ICommand } from '@nestjs/cqrs';
import { UpdateLeadStatusDto } from '@shared/modules/lead/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class UpdateLeadStatusCommand implements ICommand {
  constructor(
    public readonly payload: {
      leadId: string;
      data: UpdateLeadStatusDto;
      ctx: IGetContext;
    }
  ) {}
}
