import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLedgerByClinicIdQuery } from './get-ledger-by-clinic-id.query';
import { GetLedgerByClinicIdQueryResponse } from './get-ledger-by-clinic-id.response';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  FINANCE_LEDGER_QUERY_REPOSITORY,
  IFinanceLedgerQueryRepository,
} from '@modules/finance/finance-ledger/domain/repositories/finance-ledger/finance-ledger.query.repository';

@QueryHandler(GetLedgerByClinicIdQuery)
export class GetLedgerByClinicIdHandler
  implements
    IQueryHandler<GetLedgerByClinicIdQuery, GetLedgerByClinicIdQueryResponse>
{
  constructor(
    @Inject(FINANCE_LEDGER_QUERY_REPOSITORY)
    private readonly financeLedgerRepository: IFinanceLedgerQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
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

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) => p.actorCanAccessTargetClinic(clinicId))
      .orThrow();

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
      },
    };
  }
}
