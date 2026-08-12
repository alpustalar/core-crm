import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { RecordSupplierPayment } from '@shared/modules/financial-event/types/commands';

/**
 * Satıcıya yapılan ödemeyi kaydeder (320'deki cari borcu kapatır).
 *
 * Ayrı bir tablo tutulmaz — kalıcı kayıt `FinancialEvent`'tir; posting
 * `PaymentMadeRule` ile yapılır.
 */
export class RecordSupplierPaymentCommand implements ICommand {
  readonly __responseType!: string;

  constructor(
    public readonly payload: {
      readonly data: RecordSupplierPayment;
      readonly ctx: IGetContext;
    }
  ) {}
}
