import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';

export class MarkInstallmentAsRefundedCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly payload: {
      readonly installmentId: string;
      /** Audit log detayı; çağıran bağlama göre geçilir (POS / iyzico vb.). */
      readonly details?: string;
      readonly ctx: IGetContext;
    }
  ) {}
}
