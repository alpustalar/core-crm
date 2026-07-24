import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetCashFlowResponse } from './get-cash-flow.response';

/**
 * Nakit akışı — bir şubenin nakit/banka hesaplarındaki (10x Hazır Değerler)
 * POSTED hareketlerinin aylık giriş/çıkış dökümü. dateFrom verilirse öncesi
 * açılış nakit pozisyonu olarak devreder. Mali tablo değil; yönetim raporu.
 */
export class GetCashFlowQuery implements IQuery {
  readonly __responseType!: GetCashFlowResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      ctx: IGetContext;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {}
}
