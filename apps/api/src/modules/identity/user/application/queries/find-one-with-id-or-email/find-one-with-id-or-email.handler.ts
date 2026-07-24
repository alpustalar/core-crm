import { Inject } from '@nestjs/common';
import {
  IUserQueryRepository,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOneWithIdOrEmailQuery } from '@modules/identity/user/application/queries/find-one-with-id-or-email/find-one-with-id-or-email.query';
import { FindOneWithIdOrEmailQueryResponse } from '@modules/identity/user/application/queries/find-one-with-id-or-email/find-one-with-id-or-email.response';
import { UserNotFoundException } from '@modules/identity/user/domain/exceptions/user.exceptions';

@QueryHandler(FindOneWithIdOrEmailQuery)
export class FindOneWithIdOrEmailHandler
  implements
    IQueryHandler<FindOneWithIdOrEmailQuery, FindOneWithIdOrEmailQueryResponse>
{
  constructor(
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userRepo: IUserQueryRepository,
    @Inject(POLICY_FACTORY)
    protected readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: FindOneWithIdOrEmailQuery
  ): Promise<FindOneWithIdOrEmailQueryResponse> {
    const { userIdOrEmail, ctx } = query;
    const user = await this.userRepo.findByIdOrEmail(userIdOrEmail);

    if (!user) throw new UserNotFoundException();

    const serializationOptions = this.policyFactory
      .user(ctx.actor, ctx.source)
      .policy.getSerializationOptions(user.id.value, user?.clinicId?.value);

    return {
      data: user.toPersistence(),
      meta: {
        serializationOptions,
      },
    };
  }
}
