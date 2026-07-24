import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { Pipeline } from '@modules/crm/pipeline/domain/entities/pipeline.entity';
import { PipelineStage } from '@modules/crm/pipeline/domain/entities/pipeline-stage.entity';
import {
  PipelineStageView,
  PipelineWithStages,
} from '@modules/crm/pipeline/domain/contracts/pipeline.contracts';

export const PIPELINE_COMMAND_REPOSITORY = Symbol('IPipelineCommandRepository');
export const PIPELINE_STAGE_COMMAND_REPOSITORY = Symbol(
  'IPipelineStageCommandRepository'
);
export const PIPELINE_QUERY_REPOSITORY = Symbol('IPipelineQueryRepository');

export type IPipelineCommandRepository = IBaseCommandRepository<Pipeline>;

export interface IPipelineStageCommandRepository
  extends IBaseCommandRepository<PipelineStage> {
  /** Varsayılan huni seed'inde tüm aşamaları tek transaction'da ekler. */
  createMany(stages: PipelineStage[]): Promise<void>;
  /** Aynı huninin (silinmemiş) aşamalarını sıralı döndürür. */
  findByPipelineId(pipelineId: string): Promise<PipelineStage[]>;
}

export interface IPipelineQueryRepository {
  /** Huni + (silinmemiş) aşamaları read-model olarak. */
  findById(id: string): Promise<PipelineWithStages | null>;
  /** Kliniğin tüm (silinmemiş) hunileri + aşamaları. */
  findByClinic(clinicId: string): Promise<PipelineWithStages[]>;
  /** Kliniğin varsayılan hunisi (Lead create'te ilk aşamaya atamak için). */
  findDefaultByClinic(clinicId: string): Promise<PipelineWithStages | null>;
  /** Tek aşama (silinmemiş) — Lead move'da hedef aşamanın tip+huni çözümü için. */
  findStageById(stageId: string): Promise<PipelineStageView | null>;
}
