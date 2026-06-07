import { ICommand } from '@nestjs/cqrs';
import { ConvertLeadDto } from '@shared/modules/lead/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ConvertLeadCommand implements ICommand {
  constructor(
    public readonly leadId: string,
    public readonly dto: ConvertLeadDto,
    public readonly ctx: IGetContext,
  ) {}
}
