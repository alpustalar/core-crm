import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetIncomeStatementResponse } from './get-income-statement.response';

/**
 * Gelir Tablosu — bir şubenin belirli tarih aralığındaki POSTED fişlerinden
 * türetilen TDHP dönem kâr/zarar tablosu. dateFrom/dateTo verilmezse tüm
 * POSTED hareketler kapsanır.
 */
export class GetIncomeStatementQuery implements IQuery {
  readonly __responseType!: GetIncomeStatementResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      ctx: IGetContext;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {}
}
