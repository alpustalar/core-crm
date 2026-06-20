import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';
import {
  CreateLeadProps,
  FindLeadsFilter,
} from '@modules/crm/lead/domain/lead-contracts';

export const LEAD_COMMAND_REPOSITORY = Symbol('ILeadCommandRepository');
export const LEAD_QUERY_REPOSITORY = Symbol('ILeadQueryRepository');

export interface ILeadCommandRepository extends IBaseCommandRepository<Lead> {
  create(data: CreateLeadProps): Promise<Lead>;
}

export interface ILeadQueryRepository {
  findById(id: string): Promise<Lead | null>;
  findMany(filter: FindLeadsFilter): Promise<{ items: Lead[]; total: number }>;
}
