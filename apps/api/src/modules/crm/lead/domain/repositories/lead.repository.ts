import { Lead as ILead } from '@shared';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import {
  AdAttributedLead,
  FindAdAttributedLeadsFilter,
  FindLeadsFilter,
} from '@modules/crm/lead/domain/contracts/lead-contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const LEAD_COMMAND_REPOSITORY = Symbol('ILeadCommandRepository');
export const LEAD_QUERY_REPOSITORY = Symbol('ILeadQueryRepository');

export type ILeadCommandRepository = IBaseCommandRepository<Lead>;

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface ILeadQueryRepository {
  findById(id: string): Promise<ILead | null>;
  findMany(filter: FindLeadsFilter): Promise<Paginated<ILead>>;
  /** Reklam kampanyasına atfedilen, dönemde oluşmuş ve hastaya dönüşmüş lead'ler (ROI). */
  findAdAttributedConverted(
    filter: FindAdAttributedLeadsFilter
  ): Promise<AdAttributedLead[]>;
}
