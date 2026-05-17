import { Inject, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOneWithIdOrEmailQuery } from '@modules/user/application/queries/find-one-with-id-or-email/find-one-with-id-or-email.query';
import { QueryResponse } from '@shared/common/response/response.interface';
import { User } from '@shared';

@QueryHandler(FindOneWithIdOrEmailQuery)
export class FindOneWithIdOrEmailHandler
  implements IQueryHandler<FindOneWithIdOrEmailQuery, QueryResponse<User>>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    protected readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: FindOneWithIdOrEmailQuery) {
    const { userIdOrEmail, context } = query;
    const user = await this.userRepo.findByIdOrEmail(userIdOrEmail);

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const { policy } = this.policyFactory.user(context.actor);

    const serializationOptions = policy.getUserSerializeOptions(
      user.id,
      user?.clinicId
    );

    return {
      data: user,
      meta: {
        serializationOptions,
      },
    };
  }
}
