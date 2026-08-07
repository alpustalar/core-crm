import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProjectTaskCommandRepository,
  PROJECT_TASK_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-task/project-task.command.repository';
import { ProjectTaskNotFoundException } from '@modules/organization/project/domain/exceptions/project.exceptions';
import { AssignProjectTaskCommand } from './assign-project-task.command';

@CommandHandler(AssignProjectTaskCommand)
export class AssignProjectTaskHandler
  implements ICommandHandler<AssignProjectTaskCommand, void>
{
  constructor(
    @Inject(PROJECT_TASK_COMMAND_REPOSITORY)
    private readonly projectTaskRepo: IProjectTaskCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: AssignProjectTaskCommand): Promise<void> {
    const { taskId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const task = await this.projectTaskRepo.findById(taskId);
      if (!task) throw new ProjectTaskNotFoundException(taskId);

      // Başkasına iş atamak yönetici kararıdır.
      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) => p.canManageClinicProjects(task.clinicId.value))
        .orThrow('project-task.assign');

      task.assign(data.assigneeId);

      await this.projectTaskRepo.update(task);
    });
  }
}
