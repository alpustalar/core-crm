import { ICommand } from '@nestjs/cqrs';
import { CreateLeadDto } from '@shared/modules/lead/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CreateLeadCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly dto: CreateLeadDto,
    public readonly clinicId: string,
    public readonly ctx: IGetContext,
  ) {}
}
