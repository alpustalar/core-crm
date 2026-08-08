import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProjectPhaseCommandRepository,
  PROJECT_PHASE_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-phase/project-phase.command.repository';
import {
  IProjectTaskCommandRepository,
  PROJECT_TASK_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-task/project-task.command.repository';
import {
  ProjectPhaseMismatchException,
  ProjectPhaseNotFoundException,
  ProjectTaskNotFoundException,
} from '@modules/organization/project/domain/exceptions/project.exceptions';
import { UpdateProjectTaskCommand } from './update-project-task.command';

@CommandHandler(UpdateProjectTaskCommand)
export class UpdateProjectTaskHandler
  implements ICommandHandler<UpdateProjectTaskCommand, void>
{
  constructor(
    @Inject(PROJECT_TASK_COMMAND_REPOSITORY)
    private readonly projectTaskRepo: IProjectTaskCommandRepository,
    @Inject(PROJECT_PHASE_COMMAND_REPOSITORY)
    private readonly projectPhaseRepo: IProjectPhaseCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateProjectTaskCommand): Promise<void> {
    const { taskId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const task = await this.projectTaskRepo.findById(taskId);
      if (!task) throw new ProjectTaskNotFoundException(taskId);

      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) => p.canManageClinicProjects(task.clinicId.value))
        .orThrow('project-task.update');

      // Görev başka projenin aşamasına taşınamaz.
      if (data.phaseId) {
        const phase = await this.projectPhaseRepo.findById(data.phaseId);
        if (!phase) throw new ProjectPhaseNotFoundException(data.phaseId);
        if (phase.projectId.value !== task.projectId.value) {
          throw new ProjectPhaseMismatchException(
            data.phaseId,
            task.projectId.value
          );
        }
      }

      task.update({
        title: data.title,
        description: data.description,
        priority: data.priority,
        phaseId: data.phaseId,
        startDate: data.startDate,
        dueAt: data.dueAt,
        estimatedHours: this.toDecimal(data.estimatedHours),
        actualHours: this.toDecimal(data.actualHours),
      });

      await this.projectTaskRepo.update(task);
    });
  }

  /** undefined = dokunma, null = temizle, string = Decimal'e çevir. */
  private toDecimal(
    value: string | null | undefined
  ): Decimal | null | undefined {
    if (value === undefined) return undefined;
    return value === null ? null : new Decimal(value);
  }
}
