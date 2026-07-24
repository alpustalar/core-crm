import { z } from 'zod';
import {
  PipelineStageTypeSchema,
  PipelineStageTypeType,
} from '@input-type-schemas/PipelineStageTypeSchema';

// ==========================================
// PIPELINE (huni) — oluşturma
// ==========================================

export const CreatePipelineSchema = z.object({
  id: z.uuid().optional(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  name: z.string().min(1),
  isDefault: z.boolean().optional(),
});
export type CreatePipelineProps = z.infer<typeof CreatePipelineSchema>;

// ==========================================
// PIPELINE STAGE (aşama) — oluşturma / güncelleme
// ==========================================

export const CreatePipelineStageSchema = z.object({
  id: z.uuid().optional(),
  pipelineId: z.uuid(),
  name: z.string().min(1),
  order: z.number().int().nonnegative(),
  type: PipelineStageTypeSchema.optional(),
  color: z.string().min(1).nullable().optional(),
});
export type CreatePipelineStageProps = z.infer<typeof CreatePipelineStageSchema>;

/** Yalnız sağlanan (undefined olmayan) alanlar güncellenir. */
export const UpdatePipelineStageSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().nonnegative().optional(),
  type: PipelineStageTypeSchema.optional(),
  color: z.string().min(1).nullable().optional(),
});
export type UpdatePipelineStageProps = z.infer<typeof UpdatePipelineStageSchema>;

// ==========================================
// Varsayılan huni şablonu (org'a seed'lenir)
// ==========================================

export interface DefaultStageTemplate {
  name: string;
  order: number;
  type: PipelineStageTypeType;
  color: string;
}

export const DEFAULT_PIPELINE_NAME = 'Satış Hunisi';

export const DEFAULT_PIPELINE_STAGES: DefaultStageTemplate[] = [
  { name: 'Yeni Lead', order: 0, type: 'OPEN', color: '#94a3b8' },
  { name: 'İletişim Kuruldu', order: 1, type: 'OPEN', color: '#38bdf8' },
  { name: 'Nitelikli', order: 2, type: 'OPEN', color: '#818cf8' },
  { name: 'Teklif', order: 3, type: 'OPEN', color: '#fbbf24' },
  { name: 'Kazanıldı', order: 4, type: 'WON', color: '#34d399' },
  { name: 'Kaybedildi', order: 5, type: 'LOST', color: '#f87171' },
];

// ==========================================
// Read-model'ler (query çıktısı) — plain, entity DEĞİL
// ==========================================

export interface PipelineStageView {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  type: PipelineStageTypeType;
  color: string | null;
}

export interface PipelineWithStages {
  id: string;
  organizationId: string;
  clinicId: string;
  name: string;
  isDefault: boolean;
  stages: PipelineStageView[];
  createdAt: Date;
  updatedAt: Date;
}
