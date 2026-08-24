import { PipelineStageTypeType } from '@input-type-schemas/PipelineStageTypeSchema';

// ==========================================
// Read-model (query çıktısı) — plain, entity DEĞİL
// ==========================================

export interface PipelineStageView {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  type: PipelineStageTypeType;
  color: string | null;
}
