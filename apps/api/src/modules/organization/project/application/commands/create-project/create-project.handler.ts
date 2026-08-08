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
import { Project } from '@modules/organization/project/domain/entities/project.entity';
import { ProjectCodeTakenException } from '@modules/organization/project/domain/exceptions/project.exceptions';
import { CreateProjectCommand } from './create-project.command';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<
  CreateProjectCommand,
  string
> {
  constructor(
    @Inject(PROJECT_COMMAND_REPOSITORY)
    private readonly projectCommandRepo: IProjectCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateProjectCommand): Promise<string> {
    const { data, ctx } = command.payload;
    // Boş bırakılırsa entity'deki UUID.create(...).orThrow() kapıda durdurur.
    const clinicId = ctx.actor.clinicId ?? '';
    const organizationId = ctx.actor.organizationId ?? '';

    this.policyFactory
      .project(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicProjects(clinicId))
      .orThrow('project.create');

    return this.txManager.run(async () => {
      // Kod benzersizliği DB'de unique ile korunur; buradaki okuma kullanıcıya
      // "bu kod alınmış" diyebilmek için — aynı tx içinde olduğu için tutarlı.
      if (data.code) {
        const existing = await this.projectCommandRepo.findByCode(
          clinicId,
          data.code
        );
        if (existing) throw new ProjectCodeTakenException(data.code);
      }

      const project = Project.create({
        id: UUID.generate().value,
        clinicId,
        organizationId,
        code: data.code ?? null,
        name: data.name,
        description: data.description ?? null,
        ownerId: data.ownerId,
        startDate: data.startDate ?? null,
        dueDate: data.dueDate ?? null,
        budget: data.budget ? new Decimal(data.budget) : null,
        currency: data.currency,
        createdById: ctx.actor.userId,
      });

      const saved = await this.projectCommandRepo.create(project);
      return saved.id.value;
    });
  }
}
