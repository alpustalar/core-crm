import { PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators';
import { GetLedgerByClinicIdQueryResponse } from '@modules/finance/finance-ledger/application/queries/get-ledger-by-clinic-id/get-ledger-by-clinic-id.response';
import { IQuery } from '@nestjs/cqrs';

export interface GetLedgerByPatientIdQueryPayload {
  patientId: string;
  pagination: PaginationDto;
  ctx: IGetContext;
}

export class GetLedgerByPatientIdQuery implements IQuery {
  readonly __responseType!: GetLedgerByClinicIdQueryResponse;
  constructor(public readonly payload: GetLedgerByPatientIdQueryPayload) {}
}
