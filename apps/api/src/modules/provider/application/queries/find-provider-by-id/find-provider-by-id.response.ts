import { QueryResponse } from '@shared/common/response/response.interface';
import { Provider } from '@modules/provider/domain/entities/provider.entity';

export type FindProviderByIdQueryResponse = QueryResponse<Provider>;
