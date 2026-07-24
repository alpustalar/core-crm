import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';

export type MarkInstallmentAsCancelledCommandResponse = void;

export class MarkInstallmentAsCancelledCommand implements ICommand {
  readonly __responseType!: MarkInstallmentAsCancelledCommandResponse;
  constructor(
    public readonly installmentId: string,
    public readonly ctx: IGetContext
  ) {}
}
