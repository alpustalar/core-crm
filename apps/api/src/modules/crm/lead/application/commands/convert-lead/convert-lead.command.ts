import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ConvertLead } from '@shared';

export class ConvertLeadCommand implements ICommand {
  constructor(
    public readonly payload: {
      leadId: string;
      data: ConvertLead;
      ctx: IGetContext;
    }
  ) {}
}
