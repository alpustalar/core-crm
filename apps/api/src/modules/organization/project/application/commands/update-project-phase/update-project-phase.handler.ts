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
  ProjectPhaseNotFoundException,
  ProjectPhaseOrderTakenException,
} from '@modules/organization/project/domain/exceptions/project.exceptions';
import { UpdateProjectPhaseCommand } from './update-project-phase.command';
import { isNotUndefined } from '@common/utils/is-not-undefined';

@CommandHandler(UpdateProjectPhaseCommand)
export class UpdateProjectPhaseHandler
  implements ICommandHandler<UpdateProjectPhaseCommand, void>
{
  constructor(
    @Inject(PROJECT_PHASE_COMMAND_REPOSITORY)
    private readonly projectPhaseRepo: IProjectPhaseCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateProjectPhaseCommand): Promise<void> {
    const { phaseId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const phase = await this.projectPhaseRepo.findById(phaseId);
      if (!phase) throw new ProjectPhaseNotFoundException(phaseId);

      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) => p.canManageClinicProjects(phase.clinicId.value))
        .orThrow('project-phase.update');

      if (isNotUndefined(data.order) && data.order !== phase.order) {
        const taken = await this.projectPhaseRepo.findByOrder(
          phase.projectId.value,
          data.order
        );
        if (taken) {
          throw new ProjectPhaseOrderTakenException(
            phase.projectId.value,
            data.order
          );
        }
      }

      phase.update({
        name: data.name,
        order: data.order,
        startDate: data.startDate,
        dueDate: data.dueDate,
        budget:
          data.budget === undefined
            ? undefined
            : data.budget === null
              ? null
              : new Decimal(data.budget),
      });

      await this.projectPhaseRepo.update(phase);
    });
  }
}
