import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProjectCommandRepository,
  PROJECT_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project/project.command.repository';
import { ProjectNotFoundException } from '@modules/organization/project/domain/exceptions/project.exceptions';
import { ChangeProjectStatusCommand } from './change-project-status.command';

@CommandHandler(ChangeProjectStatusCommand)
export class ChangeProjectStatusHandler
  implements ICommandHandler<ChangeProjectStatusCommand, void>
{
  constructor(
    @Inject(PROJECT_COMMAND_REPOSITORY)
    private readonly projectRepo: IProjectCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ChangeProjectStatusCommand): Promise<void> {
    const { projectId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const project = await this.projectRepo.findById(projectId);
      if (!project) throw new ProjectNotFoundException(projectId);

      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicProjects(project.clinicId.value)
        )
        .orThrow('project.change-status');

      // Geçişin geçerliliğine entity karar verir (durum makinesi tek yerde).
      project.changeStatus(data.status, data.reason);

      await this.projectRepo.update(project);
    });
  }
}
