import { IQuery } from '@nestjs/cqrs';
import { GetLeadsDto } from '@shared/modules/lead/dto/queries';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetLeadsResponse } from './get-leads.response';

export class GetLeadsQuery implements IQuery {
  readonly __responseType!: GetLeadsResponse;
  constructor(
    public readonly clinicId: string,
    public readonly dto: GetLeadsDto,
    public readonly pagination: Pagination,
    public readonly ctx: IGetContext,
  ) {}
}
