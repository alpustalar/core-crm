import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProjectResourceAllocationCommandRepository,
  PROJECT_RESOURCE_ALLOCATION_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-resource-allocation/project-resource-allocation.command.repository';
import { ProjectAllocationNotFoundException } from '@modules/organization/project/domain/exceptions/project.exceptions';
import { ReleaseProjectResourceCommand } from './release-project-resource.command';

@CommandHandler(ReleaseProjectResourceCommand)
export class ReleaseProjectResourceHandler implements ICommandHandler<
  ReleaseProjectResourceCommand,
  void
> {
  constructor(
    @Inject(PROJECT_RESOURCE_ALLOCATION_COMMAND_REPOSITORY)
    private readonly allocationCommandRepo: IProjectResourceAllocationCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReleaseProjectResourceCommand): Promise<void> {
    const { allocationId, ctx } = command;

    await this.txManager.run(async () => {
      const allocation =
        await this.allocationCommandRepo.findById(allocationId);
      if (!allocation) {
        throw new ProjectAllocationNotFoundException(allocationId);
      }

      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicProjects(allocation.clinicId.value)
        )
        .orThrow('project-resource.release');

      // Tahsis bir plan kaydıdır, mali iz değil — geri alınması silmedir.
      await this.allocationCommandRepo.delete(allocationId);
    });
  }
}
