import { QueryResponse } from '@shared/common/response/response.interface';
import { Product } from '@shared';

export type FindProductsResponse = QueryResponse<Product[]>;
