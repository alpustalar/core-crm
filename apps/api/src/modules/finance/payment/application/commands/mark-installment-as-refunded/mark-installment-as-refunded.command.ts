import { ICommand } from '@nestjs/cqrs';

export class MarkInstallmentAsRefundedCommand implements ICommand {
  readonly __responseType!: void;
  constructor(public readonly installmentId: string) {}
}
