import { IQuery } from '@nestjs/cqrs';
import { SearchHotelsDto } from '@shared/modules/health-tourism/dto/queries';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { SearchHotelsResponse } from './search-hotels.response';

export class SearchHotelsQuery implements IQuery {
  readonly __responseType!: SearchHotelsResponse;

  constructor(
    public readonly dto: SearchHotelsDto,
    public readonly ctx: IGetContext
  ) {}
}
