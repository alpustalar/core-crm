/* eslint-disable */
import { Inject, Injectable } from '@nestjs/common';
import { CheckEmailExistsQuery } from '@modules/identity/user/application/queries/check-email-exists/check-email-exists.query';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CheckEmailExistsQueryResponse } from '@modules/identity/user/application/queries/check-email-exists/check-email-exists.response';
import {
  IUserQueryRepository,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.query.repository';

@Injectable()
export class CheckEmailIsExistUseCase {}

@QueryHandler(CheckEmailExistsQuery)
export class CheckEmailExistsHandler
  implements
    IQueryHandler<CheckEmailExistsQuery, CheckEmailExistsQueryResponse>
{
  constructor(
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userRepo: IUserQueryRepository
  ) {}

  async execute(
    query: CheckEmailExistsQuery
  ): Promise<CheckEmailExistsQueryResponse> {
    const { email } = query;
    const count = await this.userRepo.checkEmailExists(email);
    return {
      data: count > 0,
    };
  }
}
