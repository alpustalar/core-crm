import { GetClinicFinanceSummaryQueryResponse } from '@modules/finance/finance-ledger/application/queries/get-clinic-finance-summary/get-clinic-finance-summary.response';
import { IQuery } from '@nestjs/cqrs';

export class GetClinicFinanceSummaryQuery implements IQuery {
  readonly __responseType!: GetClinicFinanceSummaryQueryResponse;
  constructor(public readonly payload: any) {}
}

// TODO: tamamla
