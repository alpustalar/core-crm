import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserForAuthQuery } from './find-user-for-auth.query';
import { Inject } from '@nestjs/common';
import { FindUserForAuthQueryResponse } from '@modules/identity/user/application/queries/find-user-for-auth/find-user-for-auth.response';
import {
  IUserQueryRepository,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.query.repository';

@QueryHandler(FindUserForAuthQuery)
export class FindUserForAuthHandler
  implements IQueryHandler<FindUserForAuthQuery, FindUserForAuthQueryResponse>
{
  constructor(
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userRepo: IUserQueryRepository
  ) {}

  async execute(
    query: FindUserForAuthQuery
  ): Promise<FindUserForAuthQueryResponse> {
    const result = await this.userRepo.findForAuth(query.firebaseUid);
    return {
      data: result,
    };
  }
}
