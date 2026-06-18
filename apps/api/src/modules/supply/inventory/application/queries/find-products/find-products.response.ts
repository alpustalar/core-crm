import { QueryResponse } from '@shared/common/response/response.interface';
import { Product } from '@modules/supply/inventory/domain/entities/product.entity';

export type FindProductsResponse = QueryResponse<Product[]>;
