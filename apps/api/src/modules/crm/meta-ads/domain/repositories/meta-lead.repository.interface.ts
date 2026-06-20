import { MetaLead } from '@modules/crm/meta-ads/domain/entities/meta-lead.entity';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';
import {
  CreateMetaLeadData,
  FindMetaLeadsFilter,
} from '@modules/crm/meta-ads/domain/meta-ads.contracts';

export const META_LEAD_COMMAND_REPOSITORY = Symbol(
  'IMetaLeadCommandRepository'
);
export const META_LEAD_QUERY_REPOSITORY = Symbol('IMetaLeadQueryRepository');

export interface IMetaLeadCommandRepository
  extends IBaseCommandRepository<MetaLead> {
  create(data: CreateMetaLeadData): Promise<MetaLead>;
}

export interface IMetaLeadQueryRepository {
  findById(id: string): Promise<MetaLead | null>;
  findByMetaLeadId(metaLeadId: string): Promise<MetaLead | null>;
  findMatchedLeadByPatientId(patientId: string): Promise<MetaLead | null>;
  findByPhone(phone: string, clinicId: string): Promise<MetaLead | null>;
  findByEmail(email: string, clinicId: string): Promise<MetaLead | null>;
  findMany(
    filter: FindMetaLeadsFilter
  ): Promise<{ items: MetaLead[]; total: number }>;
  countByAccountAndStatus(
    metaAdAccountId: string,
    status: string
  ): Promise<number>;
}
