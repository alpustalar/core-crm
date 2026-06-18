import { ICommand } from '@nestjs/cqrs';

export class MarkInstallmentAsPaidCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly installmentId: string,
    /** Audit log detayı; çağıran bağlama göre geçilir (POS / iyzico vb.). */
    public readonly details?: string
  ) {}
}
