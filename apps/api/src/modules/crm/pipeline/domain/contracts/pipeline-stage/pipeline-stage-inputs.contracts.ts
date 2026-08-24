import { PipelineStageTypeType } from '@input-type-schemas/PipelineStageTypeSchema';

// ==========================================
// PIPELINE STAGE (aşama) — oluşturma / güncelleme
// ==========================================

export interface CreatePipelineStageProps {
  id?: string;
  pipelineId: string;
  name: string;
  order: number;
  type?: PipelineStageTypeType;
  color?: string | null;
}

/** Yalnız sağlanan (undefined olmayan) alanlar güncellenir. */
export interface UpdatePipelineStageProps {
  name?: string;
  order?: number;
  type?: PipelineStageTypeType;
  color?: string | null;
}
