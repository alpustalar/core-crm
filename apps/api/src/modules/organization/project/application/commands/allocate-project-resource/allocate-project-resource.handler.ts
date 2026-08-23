import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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
  IProjectResourceAllocationCommandRepository,
  PROJECT_RESOURCE_ALLOCATION_COMMAND_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-resource-allocation/project-resource-allocation.command.repository';
import { ProjectResourceAllocation } from '@modules/organization/project/domain/entities/project-resource-allocation.entity';
import {
  checkCapacity,
  normalizeAllocationPercent,
} from '@modules/organization/project/domain/rules/resource-capacity.rules';
import {
  ProjectAllocationConflictException,
  ProjectNotFoundException,
  ProjectPhaseMismatchException,
  ProjectPhaseNotFoundException,
} from '@modules/organization/project/domain/exceptions/project.exceptions';
import { AllocateProjectResourceCommand } from './allocate-project-resource.command';

/**
 * Kaynak tahsisi. Kapasite kontrolü ile yazma **aynı transaction içinde** yapılır:
 * iki eşzamanlı tahsis isteği ayrı ayrı "yer var" görüp aynı personeli %150'ye
 * çıkarmasın diye örtüşen tahsisler Command Repo'dan okunur.
 */
@CommandHandler(AllocateProjectResourceCommand)
export class AllocateProjectResourceHandler implements ICommandHandler<
  AllocateProjectResourceCommand,
  string
> {
  constructor(
    @Inject(PROJECT_COMMAND_REPOSITORY)
    private readonly projectRepo: IProjectCommandRepository,
    @Inject(PROJECT_PHASE_COMMAND_REPOSITORY)
    private readonly projectPhaseRepo: IProjectPhaseCommandRepository,
    @Inject(PROJECT_RESOURCE_ALLOCATION_COMMAND_REPOSITORY)
    private readonly projectResourceAllocationRepo: IProjectResourceAllocationCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: AllocateProjectResourceCommand): Promise<string> {
    const { projectId, data, ctx } = command.payload;

    return this.txManager.run(async () => {
      const project = await this.projectRepo.findById(projectId);
      if (!project) throw new ProjectNotFoundException(projectId);

      this.policyFactory
        .project(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicProjects(project.clinicId.value)
        )
        .orThrow('project-resource.allocate');

      project.assertAcceptsWork('kaynak tahsisi');

      if (data.phaseId) {
        const phase = await this.projectPhaseRepo.findById(data.phaseId);
        if (!phase) throw new ProjectPhaseNotFoundException(data.phaseId);
        if (phase.projectId.value !== projectId) {
          throw new ProjectPhaseMismatchException(data.phaseId, projectId);
        }
      }

      const clinicId = project.clinicId.value;
      const requestedPercent = normalizeAllocationPercent(
        data.kind,
        data.allocationPercent
      );

      // Kapasite birçok tahsis satırından türer; kilitlenecek tek satır yok.
      // Kaynağın kendi satırı çapa olarak kilitlenir — aynı transaction'da olmak
      // tek başına yetmez, iki eşzamanlı istek de "yer var" görebilirdi.
      await this.projectResourceAllocationRepo.lockResourceCapacity({
        kind: data.kind,
        resourceId: data.resourceId,
      });

      const overlapping =
        await this.projectResourceAllocationRepo.findOverlapping({
          clinicId,
          kind: data.kind,
          resourceId: data.resourceId,
          startDate: data.startDate,
          endDate: data.endDate,
        });

      const verdict = checkCapacity({
        kind: data.kind,
        requestedPercent,
        overlapping,
      });

      if (!verdict.ok) {
        throw new ProjectAllocationConflictException({
          kind: data.kind,
          resourceId: data.resourceId,
          requestedPercent,
          allocatedPercent: verdict.allocatedPercent,
          conflicts: verdict.conflicts.map((c) => ({
            allocationId: c.id,
            projectId: c.projectId,
            startDate: c.startDate,
            endDate: c.endDate,
            allocationPercent: c.allocationPercent,
          })),
        });
      }

      const allocation = ProjectResourceAllocation.create({
        id: UUID.generate().value,
        projectId,
        phaseId: data.phaseId ?? null,
        clinicId,
        kind: data.kind,
        resourceId: data.resourceId,
        startDate: data.startDate,
        endDate: data.endDate,
        allocationPercent: requestedPercent,
        note: data.note ?? null,
        createdById: ctx.actor.userId,
      });

      const saved = await this.projectResourceAllocationRepo.create(allocation);
      return saved.id.value;
    });
  }
}
