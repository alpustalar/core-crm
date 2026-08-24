import { Decimal } from 'decimal.js';

// ==========================================
// AŞAMA (PHASE)
// ==========================================
// name uzunluk + order min(0) sınırları HTTP sınırında (CreateProjectPhaseSchema,
// @shared/modules/project) zaten doğrulanır; domain katmanı tekrar etmez.

export interface CreateProjectPhaseProps {
  id?: string;
  projectId: string;
  clinicId: string;
  name: string;
  order: number;
  startDate?: Date | null;
  dueDate?: Date | null;
  budget?: Decimal | null;
}

export interface UpdateProjectPhaseProps {
  name?: string;
  order?: number;
  startDate?: Date | null;
  dueDate?: Date | null;
  budget?: Decimal | null;
}
