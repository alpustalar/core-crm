import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CheckInCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      readonly employeeId: string;
      readonly clinicId: string;
      readonly ctx: IGetContext;
      readonly organizationId?: string | null;
    }
  ) {}
}
