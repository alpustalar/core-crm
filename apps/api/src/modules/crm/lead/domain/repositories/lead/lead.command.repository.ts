import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';

export const LEAD_COMMAND_REPOSITORY = Symbol('ILeadCommandRepository');
export type ILeadCommandRepository = IBaseCommandRepository<Lead>;
