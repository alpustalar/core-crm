import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CLINIC_COMMAND_REPOSITORY,
  CLINIC_QUERY_REPOSITORY,
  IClinicCommandRepository,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { SoftDeleteClinicCommand } from '@modules/organization/clinic/application/commands/soft-delete-clinic/soft-delete-clinic.command';
import { Inject } from '@nestjs/common';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';

@CommandHandler(SoftDeleteClinicCommand)
export class SoftDeleteClinicHandler
  implements ICommandHandler<SoftDeleteClinicCommand>
{
  constructor(
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicQueryRepo: IClinicQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: SoftDeleteClinicCommand): Promise<void> {
    const { clinicId, ctx } = command;

    if (!ExecutionPolicy.isSystemInitiated(ctx.source)) {
      const { evaluator } = this.policyFactory.clinic(ctx.actor);
      evaluator
        .check(
          (p) => p.actorCanManageTargetClinic(clinicId),
          'Bu kliniği silme isteği gönderme yetkiniz yok.'
        )
        .orThrow();
    }

    await this.transactionManager.run(async () => {
      const clinic = await this.clinicQueryRepo.findById(clinicId);
      if (!clinic) return;

      clinic.softDelete(ctx.actor?.userId);
      await this.clinicCommandRepo.save(clinic);
    });
  }
}
