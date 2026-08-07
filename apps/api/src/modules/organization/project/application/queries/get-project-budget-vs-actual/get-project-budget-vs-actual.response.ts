import { QueryResponse } from '@shared/common/response/response.interface';

/** Tek aşamanın bütçe/fiili kırılımı. Tutarlar string (Decimal serileştirmesi). */
export interface PhaseBudgetLine {
  phaseId: string;
  phaseName: string;
  budget: string | null;
  actual: string;
  variance: string | null;
}

/** Maliyetin nereden geldiği kırılımı — "para nereye gitti" sorusunun cevabı. */
export interface CostSourceLine {
  source: string;
  amount: string;
}

export interface ProjectBudgetVsActual {
  projectId: string;
  currency: string;
  budget: string | null;
  actual: string;
  /** budget - actual; bütçe yoksa null. Negatif = aşım. */
  variance: string | null;
  /** Bütçenin yüzde kaçı harcandı; bütçe yoksa null. */
  utilizationPercent: number | null;
  isOverBudget: boolean;
  /** Aşamaya bağlanmamış maliyetler `phaseId: null` satırında toplanır. */
  phases: PhaseBudgetLine[];
  unassigned: string;
  bySource: CostSourceLine[];
}

export type GetProjectBudgetVsActualResponse =
  QueryResponse<ProjectBudgetVsActual | null>;
