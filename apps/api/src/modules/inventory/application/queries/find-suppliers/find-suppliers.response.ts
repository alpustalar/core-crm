import { QueryResponse } from '@shared/common/response/response.interface';
import { Supplier } from '@modules/inventory/domain/entities/supplier.entity';

export type FindSuppliersResponse = QueryResponse<{ items: Supplier[]; total: number }>;
