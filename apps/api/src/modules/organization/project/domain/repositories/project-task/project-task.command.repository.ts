import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { ProjectTask } from '@modules/organization/project/domain/entities/project-task.entity';

export const PROJECT_TASK_COMMAND_REPOSITORY = Symbol(
  'IProjectTaskCommandRepository'
);

export type IProjectTaskCommandRepository =
  IBaseCommandRepository<ProjectTask> & {
    /** Yeni kartın kolon sonuna eklenmesi için mevcut en büyük sıra. */
    maxBoardOrder(projectId: string, status: string): Promise<number>;
  };
