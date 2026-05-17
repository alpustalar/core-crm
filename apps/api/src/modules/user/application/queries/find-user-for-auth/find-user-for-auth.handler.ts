import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserForAuthQuery } from './find-user-for-auth.query';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { AuthUserResponse } from '@modules/user/domain/types/auth-user-response.type';

@QueryHandler(FindUserForAuthQuery)
export class FindUserForAuthHandler
  implements IQueryHandler<FindUserForAuthQuery, AuthUserResponse | null>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository
  ) {}

  async execute(query: FindUserForAuthQuery) {
    return await this.userRepo.findForAuth(query.firebaseUid);
  }
}
