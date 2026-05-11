import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserForAuthQuery } from './find-user-for-auth.query';

@QueryHandler(FindUserForAuthQuery)
export class FindUserForAuthHandler implements IQueryHandler<FindUserForAuthQuery> {
  constructor() {}

  async execute(query: FindUserForAuthQuery): Promise<any> {
    const { payload } = query;
    // Business logic goes here
  }
}