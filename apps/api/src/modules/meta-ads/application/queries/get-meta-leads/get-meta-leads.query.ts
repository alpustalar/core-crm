import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { MetaLeadStatus } from '@prisma/client';
import { Pagination } from '@shared/common';

export class GetMetaLeadsQuery implements IQuery {
  constructor(
    public readonly clinicId: string,
    public readonly pagination: Pagination,
    public readonly ctx: IGetContext,
    public readonly status?: MetaLeadStatus,
  ) {}
}
