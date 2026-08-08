import { Injectable } from '@nestjs/common';
import { IQuery, QueryBus } from '@nestjs/cqrs';

@Injectable()
export class TSQueryBus {
  constructor(private readonly queryBus: QueryBus) {}

  async execute<TQuery extends IQuery>(
    query: TQuery
  ): Promise<TQuery extends { __responseType: infer TRes } ? TRes : any> {
    return this.queryBus.execute(query);
  }
}
