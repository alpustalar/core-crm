import { QueryResponse } from '@shared/common/response/response.interface';
import { LineMatchSuggestion } from '@modules/finance/bank/domain/contracts';

export type GetLineMatchSuggestionsResponse = QueryResponse<
  LineMatchSuggestion[]
>;
