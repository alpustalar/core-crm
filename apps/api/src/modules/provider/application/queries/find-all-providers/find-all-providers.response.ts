import { QueryResponse } from '@shared';
import { Provider } from '@modules/provider/domain/entities/provider.entity';

export type FindAllProvidersQueryResponse = QueryResponse<Provider[]>;
