import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicFinanceSummaryQueryResponse } from '@modules/finance/finance-ledger/application/queries/get-clinic-finance-summary/get-clinic-finance-summary.response';

/**
 * Bir şubenin tek taraflı finans defterinden gelir/gider/bakiye özeti
 * (COMPLETED kayıtlar). Opsiyonel tarih aralığı.
 */
export class GetClinicFinanceSummaryQuery implements IQuery {
  readonly __responseType!: GetClinicFinanceSummaryQueryResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date
  ) {}
}
