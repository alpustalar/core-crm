import { ProjectTask as IProjectTask } from '@shared';
import { Paginated } from '@common/interfaces/paginated.type';
import {
  FindMyProjectTasksFilter,
  FindProjectTasksFilter,
} from '@modules/organization/project/domain/contracts/project.contracts';

export const PROJECT_TASK_QUERY_REPOSITORY = Symbol(
  'IProjectTaskQueryRepository'
);

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IProjectTaskQueryRepository {
  /** Pano dökümü — kolon ve kolon-içi sıraya göre sıralı, sayfalanmaz. */
  findByProject(filter: FindProjectTasksFilter): Promise<IProjectTask[]>;

  /** "Bana atanan işler" — klinik geneli, termin sırasında, sayfalı. */
  findAssignedTo(
    filter: FindMyProjectTasksFilter
  ): Promise<Paginated<IProjectTask>>;
}
