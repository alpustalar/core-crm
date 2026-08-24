import { QueryResponse } from '@shared/common/response/response.interface';
import { AdAttributedLead } from '@modules/crm/lead/domain/contracts/lead';

export type GetAdAttributedLeadsResponse = QueryResponse<AdAttributedLead[]>;
