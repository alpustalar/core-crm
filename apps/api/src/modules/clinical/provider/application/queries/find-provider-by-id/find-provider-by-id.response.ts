import { QueryResponse } from '@shared/common/response/response.interface';
import { Provider } from '@modules/clinical/provider/domain/entities/provider.entity';

export type FindProviderByIdQueryResponse = QueryResponse<Provider>;
