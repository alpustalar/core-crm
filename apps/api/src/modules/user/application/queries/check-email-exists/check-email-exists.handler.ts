/* eslint-disable */
import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import { CheckEmailExistsQuery } from '@modules/user/application/queries/check-email-exists/check-email-exists.query';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QueryResponse } from '@shared/common/response/response.interface';

@Injectable()
export class CheckEmailIsExistUseCase {}

@QueryHandler(CheckEmailExistsQuery)
export class CheckEmailExistsHandler
  implements IQueryHandler<CheckEmailExistsQuery, QueryResponse<boolean>>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository
  ) {}

  async execute(query: CheckEmailExistsQuery) {
    const { email } = query;
    const count = await this.userRepo.checkEmailExists(email);
    return {
      data: count > 0,
    };
  }
}
