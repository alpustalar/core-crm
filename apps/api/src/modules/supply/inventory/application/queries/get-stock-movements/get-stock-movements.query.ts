import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetStockMovementsDto } from '@shared/modules/inventory/dto/queries';
import { GetStockMovementsResponse } from './get-stock-movements.response';
import { PaginationDto } from '@shared';

export class GetStockMovementsQuery implements IQuery {
  readonly __responseType!: GetStockMovementsResponse;
  constructor(
    public readonly clinicId: string,
    public readonly dto: GetStockMovementsDto,
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext
  ) {}
}
