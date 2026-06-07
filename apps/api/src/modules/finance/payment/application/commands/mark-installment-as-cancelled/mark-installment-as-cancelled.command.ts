import { ICommand } from '@nestjs/cqrs';

export class MarkInstallmentAsCancelledCommand implements ICommand {
  readonly __responseType!: void;
  constructor(public readonly installmentId: string) {}
}
