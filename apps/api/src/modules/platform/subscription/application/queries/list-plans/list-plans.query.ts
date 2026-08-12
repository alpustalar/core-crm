import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { ListPlansResponse } from './list-plans.response';

/** Aktif plan kataloğu (fiyat + bundle modüller). */
export class ListPlansQuery implements IQuery {
  readonly __responseType!: ListPlansResponse;

  constructor(public readonly ctx: IGetContext) {}
}
