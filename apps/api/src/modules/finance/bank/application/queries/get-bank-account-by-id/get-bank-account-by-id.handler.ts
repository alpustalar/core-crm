import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBankAccountByIdQuery } from './get-bank-account-by-id.query';
import { GetBankAccountByIdResponse } from './get-bank-account-by-id.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  BANK_ACCOUNT_QUERY_REPOSITORY,
  IBankAccountQueryRepository,
} from '@modules/finance/bank/domain/repositories/bank-account/bank-account.query.repository';

@QueryHandler(GetBankAccountByIdQuery)
export class GetBankAccountByIdHandler
  implements IQueryHandler<GetBankAccountByIdQuery, GetBankAccountByIdResponse>
{
  constructor(
    @Inject(BANK_ACCOUNT_QUERY_REPOSITORY)
    private readonly bankAccountRepo: IBankAccountQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetBankAccountByIdQuery
  ): Promise<GetBankAccountByIdResponse> {
    const { accountId, ctx } = query;
    const data = await this.bankAccountRepo.findById(accountId);

    if (!data) return { data: null };

    this.policyFactory
      .finance(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicFinances(data.clinicId))
      .orThrow('bank-account.detail');

    return { data };
  }
}
