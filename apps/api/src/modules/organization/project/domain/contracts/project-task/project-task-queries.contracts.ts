import { Pagination } from '@shared/common';
import { ProjectTaskStatusType as TaskStatus } from '@input-type-schemas/ProjectTaskStatusSchema';

export interface FindProjectTasksFilter {
  projectId: string;
  status?: TaskStatus;
  assigneeId?: string;
  phaseId?: string;
}

export interface FindMyProjectTasksFilter {
  clinicId: string;
  assigneeId: string;
  status?: TaskStatus;
  pagination: Pagination;
}

/** Kanban kolonu başına görev sayısı (pano özeti). */
export interface ProjectTaskStatusCountRow {
  status: TaskStatus;
  count: number;
}
