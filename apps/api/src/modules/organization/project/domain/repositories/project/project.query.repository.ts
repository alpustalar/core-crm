import { Project as IProject, ProjectPhase as IProjectPhase } from '@shared';
import { Paginated } from '@common/interfaces/paginated.type';
import {
  FindProjectsFilter,
  ProjectCostTotalRow,
  ProjectTaskStatusCountRow,
} from '@modules/organization/project/domain/contracts';

export const PROJECT_QUERY_REPOSITORY = Symbol('IProjectQueryRepository');

/** Proje detayı: künye + sıralı aşamalar (aynı bounded context, tek sorgu). */
export type ProjectWithPhases = IProject & { phases: IProjectPhase[] };

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IProjectQueryRepository {
  findMany(filter: FindProjectsFilter): Promise<Paginated<IProject>>;
  findByIdWithPhases(id: string): Promise<ProjectWithPhases | null>;

  /** Bütçe-vs-fiili raporunun ham verisi: aşama + kaynak kırılımlı maliyet toplamı. */
  costTotals(projectId: string): Promise<ProjectCostTotalRow[]>;

  /** Pano özeti: kolon başına görev sayısı. */
  taskStatusCounts(projectId: string): Promise<ProjectTaskStatusCountRow[]>;
}
