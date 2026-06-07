import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { CreateLeadProps } from '@modules/crm/lead/domain/types/create-lead.props';
import { FindLeadsFilter } from '@modules/crm/lead/domain/types/find-leads.type';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const LEAD_COMMAND_REPOSITORY = Symbol('ILeadCommandRepository');
export const LEAD_QUERY_REPOSITORY = Symbol('ILeadQueryRepository');

export interface ILeadCommandRepository extends IBaseCommandRepository<Lead> {
  create(props: CreateLeadProps): Promise<Lead>;
}

export interface ILeadQueryRepository {
  findById(id: string): Promise<Lead | null>;
  findMany(filter: FindLeadsFilter): Promise<{ items: Lead[]; total: number }>;
}
