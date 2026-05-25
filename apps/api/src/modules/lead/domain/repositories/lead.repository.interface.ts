import { Lead } from '@modules/lead/domain/entities/lead.entity';
import { CreateLeadProps } from '@modules/lead/domain/types/create-lead.props';
import { FindLeadsFilter } from '@modules/lead/domain/types/find-leads.type';

export const LEAD_COMMAND_REPOSITORY = Symbol('ILeadCommandRepository');
export const LEAD_QUERY_REPOSITORY = Symbol('ILeadQueryRepository');

export interface ILeadCommandRepository {
  create(props: CreateLeadProps): Promise<Lead>;
  save(entity: Lead): Promise<Lead>;
}

export interface ILeadQueryRepository {
  findById(id: string): Promise<Lead | null>;
  findMany(filter: FindLeadsFilter): Promise<{ items: Lead[]; total: number }>;
}
