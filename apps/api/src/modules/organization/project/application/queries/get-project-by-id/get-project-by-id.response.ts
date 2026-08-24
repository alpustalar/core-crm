import { QueryResponse } from '@shared/common/response/response.interface';
import { Project, ProjectPhase } from '@shared';
import { ProjectTaskStatusCountRow } from '@modules/organization/project/domain/contracts';

/** Proje detayı: künye + sıralı aşamalar + kolon başına görev sayısı. */
export interface ProjectDetailView {
  project: Project;
  phases: ProjectPhase[];
  taskCounts: ProjectTaskStatusCountRow[];
}

export type GetProjectByIdResponse = QueryResponse<ProjectDetailView | null>;
