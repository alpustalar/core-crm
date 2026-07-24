import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetBalanceSheetResponse } from './get-balance-sheet.response';

/**
 * Bilanço — bir şubenin POSTED fişlerinden türetilen TDHP bilançosu. Dönem
 * sonucu (kâr/zarar) gelir tablosundan hesaplanıp öz kaynağa eklenir.
 * dateTo bir "as-of" tarihi gibi davranır (o tarihe kadarki bakiyeler).
 */
export class GetBalanceSheetQuery implements IQuery {
  readonly __responseType!: GetBalanceSheetResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      ctx: IGetContext;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {}
}
