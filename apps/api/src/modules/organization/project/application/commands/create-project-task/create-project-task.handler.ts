import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { ProjectTaskStatusSchema } from '@input-type-schemas/ProjectTaskStatusSchema';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import {
  IProjectCommandRepository,
  PROJECT_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project/project.command.repository';
import {
  IProjectPhaseCommandRepository,
  PROJECT_PHASE_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-phase/project-phase.command.repository';
import {
  IProjectTaskCommandRepository,
  PROJECT_TASK_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-task/project-task.command.repository';
import { ProjectTask } from '@modules/organization/project/domain/entities/project-task.entity';
import {
  ProjectNotFoundException,
  ProjectPhaseMismatchException,
  ProjectPhaseNotFoundException,
} from '@modules/organization/project/domain/exceptions/project.exceptions';
import { CreateProjectTaskCommand } from './create-project-task.command';

@CommandHandler(CreateProjectTaskCommand)
export class CreateProjectTaskHandler
  implements ICommandHandler<CreateProjectTaskCommand, string>
{
  constructor(
    @Inject(PROJECT_COMMAND_REPOSITORY)
    private readonly projectRepo: IProjectCommandRepository,
    @Inject(PROJECT_PHASE_COMMAND_REPOSITORY)
    private readonly projectPhaseRepo: IProjectPhaseCommandRepository,
    @Inject(PROJECT_TASK_COMMAND_REPOSITORY)
    private readonly projectTaskRepo: IProjectTaskCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateProjectTaskCommand): Promise<string> {
    const { projectId, data, ctx } = command.payload;

    return this.txManager.run(async () => {
      const project = await this.projectRepo.findById(projectId);
      if (!project) throw new ProjectNotFoundException(projectId);

      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicProjects(project.clinicId.value)
        )
        .orThrow('project-task.create');

      project.assertAcceptsWork('görev ekleme');

      if (data.phaseId) {
        await this.assertPhaseBelongsToProject(data.phaseId, projectId);
      }

      // Yeni kart to-do kolonunun sonuna eklenir
      const maxOrder = await this.projectTaskRepo.maxBoardOrder(
        projectId,
        ProjectTaskStatusSchema.enum.TODO
      );

      const task = ProjectTask.create({
        id: UUID.generate().value,
        projectId,
        phaseId: data.phaseId ?? null,
        clinicId: project.clinicId.value,
        organizationId: project.organizationId.value,
        parentTaskId: data.parentTaskId ?? null,
        title: data.title,
        description: data.description ?? null,
        priority: data.priority,
        assigneeId: data.assigneeId ?? null,
        startDate: data.startDate ?? null,
        dueAt: data.dueAt ?? null,
        estimatedHours: data.estimatedHours
          ? new Decimal(data.estimatedHours)
          : null,
        boardOrder: maxOrder + 1,
        createdById: ctx.actor.userId,
      });

      const saved = await this.projectTaskRepo.create(task);
      return saved.id.value;
    });
  }

  private async assertPhaseBelongsToProject(
    phaseId: string,
    projectId: string
  ): Promise<void> {
    const phase = await this.projectPhaseRepo.findById(phaseId);
    if (!phase) throw new ProjectPhaseNotFoundException(phaseId);
    if (phase.projectId.value !== projectId) {
      throw new ProjectPhaseMismatchException(phaseId, projectId);
    }
  }
}
