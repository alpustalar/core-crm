import { Decimal } from 'decimal.js';
import { ProjectTaskPriorityType as TaskPriority } from '@input-type-schemas/ProjectTaskPrioritySchema';
import { ProjectTaskStatusType as TaskStatus } from '@input-type-schemas/ProjectTaskStatusSchema';

// ==========================================
// GÖREV (TASK)
// ==========================================
// title uzunluk sınırı HTTP sınırında (CreateProjectTaskSchema,
// @shared/modules/project) zaten doğrulanır; domain katmanı tekrar etmez.

export interface CreateProjectTaskProps {
  id?: string;
  projectId: string;
  phaseId?: string | null;
  clinicId: string;
  organizationId: string;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  assigneeId?: string | null;
  startDate?: Date | null;
  dueAt?: Date | null;
  estimatedHours?: Decimal | null;
  boardOrder?: number;
  createdById: string;
}

export interface UpdateProjectTaskProps {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  phaseId?: string | null;
  startDate?: Date | null;
  dueAt?: Date | null;
  estimatedHours?: Decimal | null;
  actualHours?: Decimal | null;
}

/** Kanban hareketi: kolon (status) + kolon içi sıra birlikte değişir. */
export interface MoveProjectTaskProps {
  readonly status: TaskStatus;
  readonly boardOrder: number;
}
