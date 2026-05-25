import { Lead } from '@modules/lead/domain/entities/lead.entity';

export interface GetLeadsResponse {
  items: Lead[];
  total: number;
}
