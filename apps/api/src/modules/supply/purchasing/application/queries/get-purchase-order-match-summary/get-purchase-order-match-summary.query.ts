import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetPurchaseOrderMatchSummaryResponse } from './get-purchase-order-match-summary.response';

/** Siparişin fatura eşleştirme durumu: sipariş / teslim / fatura üçlüsü ve sapma. */
export class GetPurchaseOrderMatchSummaryQuery implements IQuery {
  readonly __responseType!: GetPurchaseOrderMatchSummaryResponse;

  constructor(
    public readonly orderId: string,
    public readonly ctx: IGetContext
  ) {}
}
