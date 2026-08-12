import { Lead as ILead } from '@shared';
import {
  AdAttributedLead,
  FindAdAttributedLeadsFilter,
  FindLeadsFilter,
} from '@modules/crm/lead/domain/contracts/lead-contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const LEAD_QUERY_REPOSITORY = Symbol('ILeadQueryRepository');

export interface ILeadQueryRepository {
  findById(id: string): Promise<ILead | null>;
  findMany(filter: FindLeadsFilter): Promise<Paginated<ILead>>;
  /** Reklam kampanyasına atfedilen, dönemde oluşmuş ve hastaya dönüşmüş lead'ler (ROI). */
  findAdAttributedConverted(
    filter: FindAdAttributedLeadsFilter
  ): Promise<AdAttributedLead[]>;
}
