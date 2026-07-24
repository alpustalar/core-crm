import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetLeadsResponse } from './get-leads.response';
import { GetLeads } from '@shared';

export class GetLeadsQuery implements IQuery {
  readonly __responseType!: GetLeadsResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      data: GetLeads;
      pagination: Pagination;
      ctx: IGetContext;
    }
  ) {}
}
