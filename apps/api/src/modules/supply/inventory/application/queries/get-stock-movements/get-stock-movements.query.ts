import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetStockMovementsResponse } from './get-stock-movements.response';
import { GetStockMovements, Pagination } from '@shared';

interface GetStockMovementsQueryPayload {
  clinicId: string;
  data: GetStockMovements;
  pagination: Pagination;
  ctx: IGetContext;
}

export class GetStockMovementsQuery implements IQuery {
  readonly __responseType!: GetStockMovementsResponse;
  constructor(public readonly payload: GetStockMovementsQueryPayload) {}
}
