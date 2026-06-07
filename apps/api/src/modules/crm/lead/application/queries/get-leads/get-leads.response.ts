import { QueryResponse } from '@shared/common/response/response.interface';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';

export type GetLeadsResponse = QueryResponse<Lead[]>;
