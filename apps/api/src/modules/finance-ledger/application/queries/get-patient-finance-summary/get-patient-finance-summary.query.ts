import { IGetContext } from '@common/decorators';
import { GetPatientFinanceSummaryQueryResponse } from '@modules/finance-ledger/application/queries/get-patient-finance-summary/get-patient-finance-summary.response';
import { IQuery } from '@nestjs/cqrs';

export class GetPatientFinanceSummaryQuery implements IQuery {
  readonly __responseType!: GetPatientFinanceSummaryQueryResponse;
  constructor(
    public readonly patientId: string,
    public readonly ctx: IGetContext
  ) {}
}
