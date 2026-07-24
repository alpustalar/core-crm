import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class MatchLeadToPatientCommand implements ICommand {
  constructor(
    public readonly payload: {
      leadId: string;
      patientId: string;
      ctx: IGetContext;
    }
  ) {}
}
