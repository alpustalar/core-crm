import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { Pipeline } from '@modules/crm/pipeline/domain/entities/pipeline.entity';

export const PIPELINE_COMMAND_REPOSITORY = Symbol('IPipelineCommandRepository');

export type IPipelineCommandRepository = IBaseCommandRepository<Pipeline>;
