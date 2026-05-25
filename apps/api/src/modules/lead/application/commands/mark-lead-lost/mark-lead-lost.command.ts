import { ICommand } from '@nestjs/cqrs';
import { MarkLeadLostDto } from '@shared/modules/lead/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class MarkLeadLostCommand implements ICommand {
  constructor(
    public readonly leadId: string,
    public readonly dto: MarkLeadLostDto,
    public readonly ctx: IGetContext,
  ) {}
}
