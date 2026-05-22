import { PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators';
import { GetLedgerByClinicIdQueryResponse } from '@modules/finance-ledger/application/queries/get-ledger-by-clinic-id/get-ledger-by-clinic-id.response';
import { IQuery } from '@nestjs/cqrs';

export class GetLedgerByPatientIdQuery implements IQuery {
  readonly __responseType!: GetLedgerByClinicIdQueryResponse;
  constructor(
    public readonly patientId: string,
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext
  ) {}
}
