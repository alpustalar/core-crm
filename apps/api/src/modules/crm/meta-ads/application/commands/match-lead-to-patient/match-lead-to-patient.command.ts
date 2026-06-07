import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class MatchLeadToPatientCommand implements ICommand {
  constructor(
    public readonly leadId: string,
    public readonly patientId: string,
    public readonly ctx: IGetContext,
  ) {}
}
