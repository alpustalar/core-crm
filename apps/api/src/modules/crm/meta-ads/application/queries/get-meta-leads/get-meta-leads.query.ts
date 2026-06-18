import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetMetaLeadsResponse } from './get-meta-leads.response';
import { MetaLeadStatusType as MetaLeadStatus } from '@input-type-schemas/MetaLeadStatusSchema';

export class GetMetaLeadsQuery implements IQuery {
  readonly __responseType!: GetMetaLeadsResponse;
  constructor(
    public readonly clinicId: string,
    public readonly pagination: Pagination,
    public readonly ctx: IGetContext,
    public readonly status?: MetaLeadStatus
  ) {}
}
