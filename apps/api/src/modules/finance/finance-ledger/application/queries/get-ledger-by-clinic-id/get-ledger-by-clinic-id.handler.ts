import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLedgerByClinicIdQuery } from './get-ledger-by-clinic-id.query';
import { GetLedgerByClinicIdQueryResponse } from './get-ledger-by-clinic-id.response';
import {
  FINANCE_LEDGER_REPOSITORY,
  IFinanceLedgerRepository,
} from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetLedgerByClinicIdQuery)
export class GetLedgerByClinicIdHandler
  implements
    IQueryHandler<GetLedgerByClinicIdQuery, GetLedgerByClinicIdQueryResponse>
{
  constructor(
    @Inject(FINANCE_LEDGER_REPOSITORY)
    private readonly financeLedgerRepository: IFinanceLedgerRepository
  ) {}

  async execute(
    query: GetLedgerByClinicIdQuery
  ): Promise<GetLedgerByClinicIdQueryResponse> {
    const { clinicId, pagination, ctx } = query;
    const { items, total } =
      await this.financeLedgerRepository.findManyByClinicId(
        clinicId,
        pagination
      );

    // TODO: ctx'ten actoru alıp tenant için user policy ile kontrol sağla

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
      },
    };
  }
}
