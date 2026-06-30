import { QueryResponse } from '@shared/common/response/response.interface';
import { ProviderDirectoryEntry } from '@modules/clinical/provider/domain/contracts/provider.contracts';

export type FindProvidersDirectoryQueryResponse = QueryResponse<
  ProviderDirectoryEntry[]
>;
