import { QueryResponse } from '@shared/common/response/response.interface';
import { Supplier } from '@shared';

export type FindSuppliersResponse = QueryResponse<Supplier[]>;
