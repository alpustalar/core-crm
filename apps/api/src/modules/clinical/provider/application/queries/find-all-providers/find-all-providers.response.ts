import { QueryResponse } from '@shared';
import { Provider } from '@modules/clinical/provider/domain/entities/provider.entity';

export type FindAllProvidersQueryResponse = QueryResponse<Provider[]>;
