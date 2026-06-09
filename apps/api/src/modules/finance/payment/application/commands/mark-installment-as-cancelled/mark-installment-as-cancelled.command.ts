import { ICommand } from '@nestjs/cqrs';

export type MarkInstallmentAsCancelledCommandResponse = void

export class MarkInstallmentAsCancelledCommand implements ICommand {
  readonly __responseType!: MarkInstallmentAsCancelledCommandResponse;
  constructor(public readonly installmentId: string) {}
}
