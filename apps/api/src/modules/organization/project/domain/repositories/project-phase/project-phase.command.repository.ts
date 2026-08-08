import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { ProjectPhase } from '@modules/organization/project/domain/entities/project-phase.entity';

export const PROJECT_PHASE_COMMAND_REPOSITORY = Symbol(
  'IProjectPhaseCommandRepository'
);

export type IProjectPhaseCommandRepository =
  IBaseCommandRepository<ProjectPhase> & {
    /**
     * Sıra çakışmasını kapıda durdurur (DB'de de unique). Aşama sırası kullanıcıya
     * gösterilen bir alan olduğu için anlamlı hata döndürmek gerekir.
     */
    findByOrder(projectId: string, order: number): Promise<ProjectPhase | null>;
  };
