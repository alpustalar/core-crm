import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { FindLeadsFilter } from '@modules/crm/lead/domain/contracts/lead-contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const LEAD_COMMAND_REPOSITORY = Symbol('ILeadCommandRepository');
export const LEAD_QUERY_REPOSITORY = Symbol('ILeadQueryRepository');

export type ILeadCommandRepository = IBaseCommandRepository<Lead>;

export interface ILeadQueryRepository {
  findById(id: string): Promise<Lead | null>;
  findMany(filter: FindLeadsFilter): Promise<Paginated<Lead>>;
}
