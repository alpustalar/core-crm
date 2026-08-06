import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { SoftDeleteClinicCommand } from '@modules/organization/clinic/application/commands/soft-delete-clinic/soft-delete-clinic.command';
import { Inject } from '@nestjs/common';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { CLINIC_EVENTS } from '@src/domain/constants/events';
import {
  CLINIC_EVENT_PUBLISHER,
  IClinicEventPublisher,
} from '@modules/organization/clinic/domain/interfaces/clinic.event-publisher.interface';
import {
  CLINIC_COMMAND_REPOSITORY,
  IClinicCommandRepository,
} from '@modules/organization/clinic/domain/repositories/clinic/clinic.command.repository.interface';

@CommandHandler(SoftDeleteClinicCommand)
export class SoftDeleteClinicHandler
  implements ICommandHandler<SoftDeleteClinicCommand>
{
  constructor(
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicRepo: IClinicCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(CLINIC_EVENT_PUBLISHER)
    private readonly clinicEventPublisher: IClinicEventPublisher,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: SoftDeleteClinicCommand): Promise<void> {
    const { clinicId, ctx } = command;
    const { source, actor } = ctx;

    if (ExecutionPolicy.isSystemInitiated(source)) {
      await this.transactionManager.run(async () => {
        const clinic = await this.clinicRepo.findById(clinicId);
        if (!clinic) return;

        clinic.softDelete(actor?.userId);
        await this.clinicRepo.update(clinic);
      });
      return;
    }

    this.policyFactory
      .clinic(actor, source)
      .evaluator.check(
        (p) => p.actorCanManageTargetClinic(clinicId),
        'Bu kliniği silme isteği gönderme yetkiniz yok.'
      )
      .orThrow(CLINIC_EVENTS.SOFT_DELETE_REQUESTED);

    this.clinicEventPublisher.requestClinicSoftDelete({
      clinicId,
      actorId: actor.userId,
      actorEmail: actor.email,
    });
  }
}
