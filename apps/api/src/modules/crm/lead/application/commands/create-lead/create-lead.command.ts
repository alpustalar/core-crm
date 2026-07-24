import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateLead } from '@shared';

export class CreateLeadCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      data: CreateLead;
      clinicId: string;
      ctx: IGetContext;
    }
  ) {}
}
