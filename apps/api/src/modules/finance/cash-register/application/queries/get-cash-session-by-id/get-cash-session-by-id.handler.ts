import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCashSessionByIdQuery } from './get-cash-session-by-id.query';
import { GetCashSessionByIdResponse } from './get-cash-session-by-id.response';
import {
  CASH_SESSION_QUERY_REPOSITORY,
  ICashSessionQueryRepository,
} from '@modules/finance/cash-register/domain/repositories/cash-session.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetCashSessionByIdQuery)
export class GetCashSessionByIdHandler implements IQueryHandler<
  GetCashSessionByIdQuery,
  GetCashSessionByIdResponse
> {
  constructor(
    @Inject(CASH_SESSION_QUERY_REPOSITORY)
    private readonly sessionQueryRepo: ICashSessionQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetCashSessionByIdQuery
  ): Promise<GetCashSessionByIdResponse> {
    const { sessionId, ctx } = query;
    const data = await this.sessionQueryRepo.findByIdWithMovements(sessionId);

    if (!data) return { data: null };

    this.policyFactory
      .finance(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicFinances(data.clinicId))
      .orThrow('cash-session.detail');

    return { data };
  }
}
