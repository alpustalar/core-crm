import { IQuery } from '@nestjs/cqrs';
import { GetLeadsDto } from '@shared/modules/lead/dto/queries';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';

export class GetLeadsQuery implements IQuery {
  constructor(
    public readonly clinicId: string,
    public readonly dto: GetLeadsDto,
    public readonly pagination: Pagination,
    public readonly ctx: IGetContext,
  ) {}
}
