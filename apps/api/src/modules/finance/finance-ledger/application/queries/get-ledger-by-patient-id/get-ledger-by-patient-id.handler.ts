import { FINANCE_LEDGER_EVENTS } from '@src/domain/constants/events';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLedgerByPatientIdQuery } from './get-ledger-by-patient-id.query';
import { GetLedgerByPatientIdQueryResponse } from './get-ledger-by-patient-id.response';
import {
  FINANCE_LEDGER_QUERY_REPOSITORY,
  IFinanceLedgerQueryRepository,
} from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindPatientByIdQuery } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.query';

@QueryHandler(GetLedgerByPatientIdQuery)
export class GetLedgerByPatientIdHandler
  implements
    IQueryHandler<GetLedgerByPatientIdQuery, GetLedgerByPatientIdQueryResponse>
{
  constructor(
    @Inject(FINANCE_LEDGER_QUERY_REPOSITORY)
    private readonly financeLedgerRepository: IFinanceLedgerQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetLedgerByPatientIdQuery
  ): Promise<GetLedgerByPatientIdQueryResponse> {
    const { patientId, pagination, ctx } = query;
    const { source, actor } = ctx;

    const { data: patient } = await this.queryBus.execute(
      new FindPatientByIdQuery(patientId, ctx)
    );

    const { evaluator } = this.policyFactory.user(actor);
    evaluator
      .systemBypass(source)
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
