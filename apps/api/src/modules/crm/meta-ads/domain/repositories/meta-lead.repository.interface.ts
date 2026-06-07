import { MetaLead } from '@modules/crm/meta-ads/domain/entities/meta-lead.entity';
import { CreateMetaLeadProps } from '@modules/crm/meta-ads/domain/types/create-meta-lead.props';
import { FindMetaLeadsProps } from '@modules/crm/meta-ads/domain/types/find-meta-leads.type';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const META_LEAD_COMMAND_REPOSITORY = Symbol(
  'IMetaLeadCommandRepository'
);
export const META_LEAD_QUERY_REPOSITORY = Symbol('IMetaLeadQueryRepository');

export interface IMetaLeadCommandRepository
  extends IBaseCommandRepository<MetaLead> {
  create(props: CreateMetaLeadProps): Promise<MetaLead>;
}

export interface IMetaLeadQueryRepository {
  findById(id: string): Promise<MetaLead | null>;
  findByMetaLeadId(metaLeadId: string): Promise<MetaLead | null>;
  findMatchedLeadByPatientId(patientId: string): Promise<MetaLead | null>;
  findByPhone(phone: string, clinicId: string): Promise<MetaLead | null>;
  findByEmail(email: string, clinicId: string): Promise<MetaLead | null>;
  findMany(
    props: FindMetaLeadsProps
  ): Promise<{ items: MetaLead[]; total: number }>;
  countByAccountAndStatus(
    metaAdAccountId: string,
    status: string
  ): Promise<number>;
}
