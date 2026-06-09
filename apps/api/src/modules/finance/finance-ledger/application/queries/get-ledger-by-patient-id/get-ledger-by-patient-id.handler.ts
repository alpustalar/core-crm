import { FINANCE_LEDGER_EVENTS } from '@src/domain/constants/events';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLedgerByPatientIdQuery } from './get-ledger-by-patient-id.query';
import { GetLedgerByPatientIdQueryResponse } from './get-ledger-by-patient-id.response';
import {
  FINANCE_LEDGER_REPOSITORY,
  IFinanceLedgerRepository,
} from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { IPolicyFactory, POLICY_FACTORY, } from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  FindPatientByIdQuery
} from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.query';

@QueryHandler(GetLedgerByPatientIdQuery)
export class GetLedgerByPatientIdHandler
  implements
    IQueryHandler<GetLedgerByPatientIdQuery, GetLedgerByPatientIdQueryResponse>
{
  constructor(
    @Inject(FINANCE_LEDGER_REPOSITORY)
    private readonly financeLedgerRepository: IFinanceLedgerRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetLedgerByPatientIdQuery
  ): Promise<GetLedgerByPatientIdQueryResponse> {
    const { patientId, pagination, ctx } = query;
    const { source, actor } = ctx;

    const isSystem = ExecutionPolicy.isSystemInitiated(source);

    const patient = !isSystem
      ? (await this.queryBus.execute(new FindPatientByIdQuery(patientId, ctx)))
          .data
      : null;

    const { evaluator } = this.policyFactory.user(actor);
    evaluator
      .bypassIf(isSystem)
      .check(
        (p) => p.isTargetInActorsSameClinic(patient?.clinicId),
        'İşlem yapabilmek için hastayla aynı klinikte olmalısınız'
      )
      .orThrow(FINANCE_LEDGER_EVENTS.LEDGER);

    const { items, total } =
      await this.financeLedgerRepository.findManyByPatientIdWithDetails(
        patientId,
        pagination
      );

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
      },
    };
  }
}
