import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpsertClinicGovernmentSpecsCommand } from './upsert-clinic-government-specs.command';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { GOVERNANCE_EVENTS } from '@src/domain/constants/events';
import {
  CLINIC_GOVERNMENT_SPECS_COMMAND_REPOSITORY,
  CLINIC_GOVERNMENT_SPECS_QUERY_REPOSITORY,
  IClinicGovernmentSpecsCommandRepository,
  IClinicGovernmentSpecsQueryRepository,
} from '@modules/organization/clinic-governance/domain/repositories/clinic-government-specs.repository';
import { ClinicGovernmentSpecs } from '@modules/organization/clinic-governance/domain/entities/clinic-government-specs.entity';

@CommandHandler(UpsertClinicGovernmentSpecsCommand)
export class UpsertClinicGovernmentSpecsHandler implements ICommandHandler<
  UpsertClinicGovernmentSpecsCommand,
  void
> {
  constructor(
    @Inject(CLINIC_GOVERNMENT_SPECS_QUERY_REPOSITORY)
    private readonly specsQueryRepo: IClinicGovernmentSpecsQueryRepository,
    @Inject(CLINIC_GOVERNMENT_SPECS_COMMAND_REPOSITORY)
    private readonly specsCommandRepo: IClinicGovernmentSpecsCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpsertClinicGovernmentSpecsCommand): Promise<void> {
    const { clinicId, data, ctx } = command.payload;

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check(
        (p) => p.actorCanAccessTargetClinic(clinicId),
        'Bu kliniğin resmi/regülasyon bilgilerini yönetme yetkiniz yok.'
      )
      .orThrow(GOVERNANCE_EVENTS.UPSERT_CLINIC_SPECS);

    await this.txManager.run(async () => {
      const existing = await this.specsQueryRepo.findByClinicId(clinicId);
      if (existing) {
        existing.update({
          healthFacilityCode: data.healthFacilityCode,
          ussPassword: data.ussPassword ?? null,
          companyTaxNumber: data.companyTaxNumber ?? null,
          legalType: data.legalType,
        });
        await this.specsCommandRepo.update(existing);
        return;
      }

      const entity = ClinicGovernmentSpecs.create({
        clinicId,
        healthFacilityCode: data.healthFacilityCode,
        ussPassword: data.ussPassword ?? null,
        companyTaxNumber: data.companyTaxNumber ?? null,
        legalType: data.legalType,
      });
      await this.specsCommandRepo.create(entity);
    });
  }
}
