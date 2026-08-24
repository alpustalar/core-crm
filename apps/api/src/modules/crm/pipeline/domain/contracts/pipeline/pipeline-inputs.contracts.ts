import { PipelineStageTypeType } from '@input-type-schemas/PipelineStageTypeSchema';

// ==========================================
// PIPELINE (huni) — oluşturma
// ==========================================

export interface CreatePipelineProps {
  id?: string;
  organizationId: string;
  clinicId: string;
  name: string;
  isDefault?: boolean;
}

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
