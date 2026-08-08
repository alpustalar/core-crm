import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { ProjectCostSourceSchema } from '@input-type-schemas/ProjectCostSourceSchema';
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
  IProjectCostCommandRepository,
  PROJECT_COST_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-cost/project-cost.command.repository';
import {
  IProjectPhaseCommandRepository,
  PROJECT_PHASE_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-phase/project-phase.command.repository';
import { ProjectCost } from '@modules/organization/project/domain/entities/project-cost.entity';
import {
  ProjectCostAlreadyLinkedException,
  ProjectNotFoundException,
  ProjectPhaseMismatchException,
  ProjectPhaseNotFoundException,
} from '@modules/organization/project/domain/exceptions/project.exceptions';
import { RecordProjectCostCommand } from './record-project-cost.command';

/**
 * Projeye maliyet kalemi işler. **Muhasebe fişi üretmez** — satın alma faturası /
 * dış iş emri gibi kalemler zaten kendi modüllerinde muhasebeleşiyor; buradaki
 * kayıt yalnız bütçe-vs-fiili raporunu besleyen bir etikettir.
 */
@CommandHandler(RecordProjectCostCommand)
export class RecordProjectCostHandler implements ICommandHandler<
  RecordProjectCostCommand,
  string
> {
  constructor(
    @Inject(PROJECT_COMMAND_REPOSITORY)
    private readonly projectCommandRepo: IProjectCommandRepository,
    @Inject(PROJECT_COST_COMMAND_REPOSITORY)
    private readonly costCommandRepo: IProjectCostCommandRepository,
    @Inject(PROJECT_PHASE_COMMAND_REPOSITORY)
    private readonly phaseCommandRepo: IProjectPhaseCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RecordProjectCostCommand): Promise<string> {
    const { projectId, data, ctx } = command.payload;

    return this.txManager.run(async () => {
      const project = await this.projectCommandRepo.findById(projectId);
      if (!project) throw new ProjectNotFoundException(projectId);

      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageProjectFinancials(project.clinicId.value)
        )
        .orThrow('project-cost.record');

      project.assertAcceptsWork('maliyet kaydı');

      if (data.phaseId) {
        const phase = await this.phaseCommandRepo.findById(data.phaseId);
        if (!phase) throw new ProjectPhaseNotFoundException(data.phaseId);
        if (phase.projectId.value !== projectId) {
          throw new ProjectPhaseMismatchException(data.phaseId, projectId);
        }
      }

      const source = data.source ?? ProjectCostSourceSchema.enum.MANUAL;

      // Aynı dış kaydın iki kez etiketlenmesi bütçeyi şişirir; DB'de de unique.
      if (data.sourceRefId) {
        const linked = await this.costCommandRepo.findBySourceRef(
          projectId,
          source,
          data.sourceRefId
        );
        if (linked) {
          throw new ProjectCostAlreadyLinkedException(
            projectId,
            data.sourceRefId
          );
        }
      }

      const cost = ProjectCost.create({
        id: UUID.generate().value,
        projectId,
        phaseId: data.phaseId ?? null,
        clinicId: project.clinicId.value,
        organizationId: project.organizationId.value,
        source,
        sourceRefId: data.sourceRefId ?? null,
        description: data.description,
        amount: new Decimal(data.amount),
        currency: data.currency,
        incurredAt: data.incurredAt,
        recordedById: ctx.actor.userId,
      });

      const saved = await this.costCommandRepo.create(cost);
      return saved.id.value;
    });
  }
}
