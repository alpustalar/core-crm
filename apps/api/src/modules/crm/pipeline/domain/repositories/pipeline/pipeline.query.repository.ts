import {
  PipelineStageView,
  PipelineWithStages,
} from '@modules/crm/pipeline/domain/contracts';

export const PIPELINE_QUERY_REPOSITORY = Symbol('IPipelineQueryRepository');

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
