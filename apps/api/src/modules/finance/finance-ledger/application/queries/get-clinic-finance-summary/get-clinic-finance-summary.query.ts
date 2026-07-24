import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicFinanceSummaryQueryResponse } from '@modules/finance/finance-ledger/application/queries/get-clinic-finance-summary/get-clinic-finance-summary.response';

export interface GetClinicFinanceSummaryQueryPayload {
  clinicId: string;
  ctx: IGetContext;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Bir şubenin tek taraflı finans defterinden gelir/gider/bakiye özeti
 * (COMPLETED kayıtlar). Opsiyonel tarih aralığı.
 */
export class GetClinicFinanceSummaryQuery implements IQuery {
  readonly __responseType!: GetClinicFinanceSummaryQueryResponse;
  constructor(public readonly payload: GetClinicFinanceSummaryQueryPayload) {}
}
