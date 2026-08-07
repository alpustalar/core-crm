import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProjectCommandRepository,
  PROJECT_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project/project.command.repository';
import {
  ProjectCodeTakenException,
  ProjectNotFoundException,
} from '@modules/organization/project/domain/exceptions/project.exceptions';
import { UpdateProjectCommand } from './update-project.command';

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler implements ICommandHandler<
  UpdateProjectCommand,
  void
> {
  constructor(
    @Inject(PROJECT_COMMAND_REPOSITORY)
    private readonly projectCommandRepo: IProjectCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateProjectCommand): Promise<void> {
    const { projectId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const project = await this.projectCommandRepo.findById(projectId);
      if (!project) throw new ProjectNotFoundException(projectId);

      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicProjects(project.clinicId.value)
        )
        .orThrow('project.update');

      if (data.code && data.code !== project.code) {
        const owner = await this.projectCommandRepo.findByCode(
          project.clinicId.value,
          data.code
        );
        if (owner && owner.id.value !== projectId) {
          throw new ProjectCodeTakenException(data.code);
        }
      }

      project.updateDetails({
        code: data.code,
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        startDate: data.startDate,
        dueDate: data.dueDate,
        budget:
          data.budget === undefined
            ? undefined
            : data.budget === null
              ? null
              : new Decimal(data.budget),
      });

      await this.projectCommandRepo.update(project);
    });
  }
}
