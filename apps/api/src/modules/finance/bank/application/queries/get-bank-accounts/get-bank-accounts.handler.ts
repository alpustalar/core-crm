import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBankAccountsQuery } from './get-bank-accounts.query';
import { GetBankAccountsResponse } from './get-bank-accounts.response';
import {
  BANK_ACCOUNT_QUERY_REPOSITORY,
  IBankAccountQueryRepository,
} from '@modules/finance/bank/domain/repositories/bank-account.repository';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetBankAccountsQuery)
export class GetBankAccountsHandler implements IQueryHandler<
  GetBankAccountsQuery,
  GetBankAccountsResponse
> {
  constructor(
    @Inject(BANK_ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IBankAccountQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetBankAccountsQuery): Promise<GetBankAccountsResponse> {
    const { filter, pagination, ctx } = query.payload;
    const clinicId = ctx.actor.clinicId ?? '';

    this.policyFactory
      .finance(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicFinances(clinicId))
      .orThrow('bank-account.list');

    const result = await this.accountQueryRepo.findByClinic({
      clinicId,
      status: filter.status,
      pagination,
    });

    return {
      data: result.items,
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
