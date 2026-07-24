import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCashRegisterByIdQuery } from './get-cash-register-by-id.query';
import { GetCashRegisterByIdResponse } from './get-cash-register-by-id.response';
import {
  CASH_REGISTER_QUERY_REPOSITORY,
  ICashRegisterQueryRepository,
} from '@modules/finance/cash-register/domain/repositories/cash-register.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetCashRegisterByIdQuery)
export class GetCashRegisterByIdHandler implements IQueryHandler<
  GetCashRegisterByIdQuery,
  GetCashRegisterByIdResponse
> {
  constructor(
    @Inject(CASH_REGISTER_QUERY_REPOSITORY)
    private readonly registerQueryRepo: ICashRegisterQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetCashRegisterByIdQuery
  ): Promise<GetCashRegisterByIdResponse> {
    const { registerId, ctx } = query;
    const data = await this.registerQueryRepo.findById(registerId);

    if (!data) return { data: null };

    this.policyFactory
      .finance(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicFinances(data.clinicId))
      .orThrow('cash-register.detail');

    return { data };
  }
}
