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
import { MoveProjectTaskCommand } from './move-project-task.command';

/**
 * Panoda kart taşıma. Yönetici değil, **aynı klinik personeli** yetkisi ister:
 * herkes kendi işini ilerletebilmeli, yoksa pano işlevsiz kalır.
 */
@CommandHandler(MoveProjectTaskCommand)
export class MoveProjectTaskHandler implements ICommandHandler<
  MoveProjectTaskCommand,
  void
> {
  constructor(
    @Inject(PROJECT_TASK_COMMAND_REPOSITORY)
    private readonly taskCommandRepo: IProjectTaskCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MoveProjectTaskCommand): Promise<void> {
    const { taskId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const task = await this.taskCommandRepo.findById(taskId);
      if (!task) throw new ProjectTaskNotFoundException(taskId);

      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) => p.canAccessClinicProjects(task.clinicId.value))
        .orThrow('project-task.move');

      task.move({ status: data.status, boardOrder: data.boardOrder });

      await this.taskCommandRepo.update(task);
    });
  }
}
