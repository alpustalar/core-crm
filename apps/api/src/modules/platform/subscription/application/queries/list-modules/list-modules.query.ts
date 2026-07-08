import { IQuery } from '@nestjs/cqrs';
import { ListModulesResponse } from './list-modules.response';

/** Aktif eklenti modülleri kataloğu. */
export class ListModulesQuery implements IQuery {
  readonly __responseType!: ListModulesResponse;
}
