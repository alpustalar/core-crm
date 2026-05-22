import { PaginationDto } from '@shared';
import { GetLedgerByClinicIdQueryResponse } from '@modules/finance-ledger/application/queries/get-ledger-by-clinic-id/get-ledger-by-clinic-id.response';
import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';

export class GetLedgerByClinicIdQuery implements IQuery {
  readonly __responseType!: GetLedgerByClinicIdQueryResponse;
  constructor(
    public readonly clinicId: string,
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext
  ) {}
}
