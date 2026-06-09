import { FINANCE_LEDGER_EVENTS } from '@src/domain/constants/events';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPatientFinanceSummaryQuery } from './get-patient-finance-summary.query';
import { GetPatientFinanceSummaryQueryResponse } from './get-patient-finance-summary.response';
import {
  FINANCE_LEDGER_QUERY_REPOSITORY,
  IFinanceLedgerQueryRepository,
} from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { Inject } from '@nestjs/common';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindPatientByIdQuery } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.query';

@QueryHandler(GetPatientFinanceSummaryQuery)
export class GetPatientFinanceSummaryHandler
  implements
    IQueryHandler<
      GetPatientFinanceSummaryQuery,
      GetPatientFinanceSummaryQueryResponse
    >
{
  constructor(
    @Inject(FINANCE_LEDGER_QUERY_REPOSITORY)
    private readonly financeLedgerRepository: IFinanceLedgerQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetPatientFinanceSummaryQuery
  ): Promise<GetPatientFinanceSummaryQueryResponse> {
    const { patientId, ctx } = query;
    const { actor, source } = ctx;

    if (ExecutionPolicy.isSystemInitiated(source)) {
      return await this.getSummary(patientId);
    }

    const { data: patient } = await this.queryBus.execute(
      new FindPatientByIdQuery(patientId, ctx)
    );

    this.policyFactory
      .user(actor)
      .evaluator.check(
        (p) => p.isTargetInActorsSameClinic(patient?.clinicId),
        'Görüntülemek için misafirinizle aynı klinikte olmalısınız'
      )
      .orThrow(FINANCE_LEDGER_EVENTS.PATIENT_SUMMARY);

    return this.getSummary(patientId);
  }

  private async getSummary(patientId: string) {
    const summary =
      await this.financeLedgerRepository.getPatientSummary(patientId);

    return {
      data: summary,
    };
  }
}
