import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
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
import { ProjectPhase } from '@modules/organization/project/domain/entities/project-phase.entity';
import {
  ProjectNotFoundException,
  ProjectPhaseOrderTakenException,
} from '@modules/organization/project/domain/exceptions/project.exceptions';
import { CreateProjectPhaseCommand } from './create-project-phase.command';

@CommandHandler(CreateProjectPhaseCommand)
export class CreateProjectPhaseHandler implements ICommandHandler<
  CreateProjectPhaseCommand,
  string
> {
  constructor(
    @Inject(PROJECT_COMMAND_REPOSITORY)
    private readonly projectCommandRepo: IProjectCommandRepository,
    @Inject(PROJECT_PHASE_COMMAND_REPOSITORY)
    private readonly phaseCommandRepo: IProjectPhaseCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateProjectPhaseCommand): Promise<string> {
    const { projectId, data, ctx } = command.payload;

    return this.txManager.run(async () => {
      // Proje durumu aşama eklenip eklenemeyeceğini belirliyor → Command Repo.
      const project = await this.projectCommandRepo.findById(projectId);
      if (!project) throw new ProjectNotFoundException(projectId);

      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicProjects(project.clinicId.value)
        )
        .orThrow('project-phase.create');

      project.assertAcceptsWork('aşama ekleme');

      const taken = await this.phaseCommandRepo.findByOrder(
        projectId,
        data.order
      );
      if (taken) {
        throw new ProjectPhaseOrderTakenException(projectId, data.order);
      }

      const phase = ProjectPhase.create({
        id: UUID.generate().value,
        projectId,
        clinicId: project.clinicId.value,
        name: data.name,
        order: data.order,
        startDate: data.startDate ?? null,
        dueDate: data.dueDate ?? null,
        budget: data.budget ? new Decimal(data.budget) : null,
      });

      const saved = await this.phaseCommandRepo.create(phase);
      return saved.id.value;
    });
  }
}
