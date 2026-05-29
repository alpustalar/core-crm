import { QueryResponse } from '@shared/common/response/response.interface';
import { Product } from '@modules/inventory/domain/entities/product.entity';

export type FindProductsResponse = QueryResponse<{ items: Product[]; total: number }>;
