import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetTrialBalanceResponse } from './get-trial-balance.response';

/**
 * Mizan — bir şubenin (defter) belirli tarih aralığındaki hesap bazlı
 * borç/alacak toplamı ve bakiyesi. dateFrom/dateTo verilmezse tüm POSTED
 * fişler kapsanır.
 */
export class GetTrialBalanceQuery implements IQuery {
  readonly __responseType!: GetTrialBalanceResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      ctx: IGetContext;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {}
}
