import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { PipelineStage } from '@modules/crm/pipeline/domain/entities/pipeline-stage.entity';

export const PIPELINE_STAGE_COMMAND_REPOSITORY = Symbol(
  'IPipelineStageCommandRepository'
);

export interface IPipelineStageCommandRepository
  extends IBaseCommandRepository<PipelineStage> {
  /** Varsayılan huni seed'inde tüm aşamaları tek transaction'da ekler. */
  createMany(stages: PipelineStage[]): Promise<void>;
  /** Aynı huninin (silinmemiş) aşamalarını sıralı döndürür. */
  findByPipelineId(pipelineId: string): Promise<PipelineStage[]>;
}
