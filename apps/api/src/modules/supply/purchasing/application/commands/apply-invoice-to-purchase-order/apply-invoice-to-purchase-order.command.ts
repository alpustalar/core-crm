import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

/**
 * Bir alış faturasının siparişe eşleştirilmesi (matching). `finance/purchase-invoice`
 * modülünden CommandBus üzerinden çağrılır — sipariş bu modülün aggregate'idir,
 * dışarıdan repo'suna dokunulmaz.
 */
export class ApplyInvoiceToPurchaseOrderCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly orderId: string;
      readonly invoiceId: string;
      readonly clinicId: string;
      readonly supplierId: string;
      /** Faturanın KDV dahil toplamı. */
      readonly grandTotal: number;
      readonly currency: CurrencyType;
      readonly ctx: IGetContext;
    }
  ) {}
}
