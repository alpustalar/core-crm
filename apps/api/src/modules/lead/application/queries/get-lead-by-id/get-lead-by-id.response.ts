import { QueryResponse } from '@shared/common/response/response.interface';
import { Lead } from '@modules/lead/domain/entities/lead.entity';

export type GetLeadByIdResponse = QueryResponse<Lead>;
