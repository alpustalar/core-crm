import { IQuery } from '@nestjs/cqrs';
import { ListPlansResponse } from './list-plans.response';

/** Aktif plan kataloğu (fiyat + bundle modüller). */
export class ListPlansQuery implements IQuery {
  readonly __responseType!: ListPlansResponse;
}
