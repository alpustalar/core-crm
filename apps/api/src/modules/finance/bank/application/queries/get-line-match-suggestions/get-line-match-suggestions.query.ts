import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetLineMatchSuggestionsResponse } from './get-line-match-suggestions.response';

/**
 * Tek bir ekstre satırı için 102 defterinden aday listesi. Oto-eşleştirmenin
 * "belirsiz" bıraktığı (veya hiç eşleşmeyen) satırlarda personele seçenek sunar.
 */
export class GetLineMatchSuggestionsQuery implements IQuery {
  readonly __responseType!: GetLineMatchSuggestionsResponse;

  constructor(
    public readonly lineId: string,
    public readonly ctx: IGetContext
  ) {}
}
