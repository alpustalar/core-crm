import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetClinicFinanceSummaryQuery } from './get-clinic-finance-summary.query';
import { GetClinicFinanceSummaryQueryResponse } from './get-clinic-finance-summary.response';
import {
  FINANCE_LEDGER_QUERY_REPOSITORY,
  IFinanceLedgerQueryRepository,
} from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { FINANCE_LEDGER_EVENTS } from '@src/domain/constants/events';

@QueryHandler(GetClinicFinanceSummaryQuery)
export class GetClinicFinanceSummaryHandler
  implements
    IQueryHandler<
      GetClinicFinanceSummaryQuery,
      GetClinicFinanceSummaryQueryResponse
    >
{
  constructor(
    @Inject(FINANCE_LEDGER_QUERY_REPOSITORY)
    private readonly financeLedgerRepository: IFinanceLedgerQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetClinicFinanceSummaryQuery
  ): Promise<GetClinicFinanceSummaryQueryResponse> {
    const { clinicId, ctx, dateFrom, dateTo } = query;
    const { actor, source } = ctx;

    if (!ExecutionPolicy.isSystemInitiated(source)) {
      this.policyFactory
        .clinic(actor)
        .evaluator.check(
          (p) => p.actorCanManageTargetClinic(clinicId),
          'Bu şubenin finans özetini görüntüleme yetkiniz yok.'
        )
        .orThrow(FINANCE_LEDGER_EVENTS.CLINIC_SUMMARY);
    }

    const summary = await this.financeLedgerRepository.getClinicSummary(
      clinicId,
      { dateFrom, dateTo }
    );

    return { data: summary };
  }
}
