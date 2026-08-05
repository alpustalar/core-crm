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
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { CLINIC_EVENTS } from '@src/domain/constants/events';
import {
  CLINIC_EVENT_PUBLISHER,
  IClinicEventPublisher,
} from '@modules/organization/clinic/domain/interfaces/clinic.event-publisher.interface';

@CommandHandler(SoftDeleteClinicCommand)
export class SoftDeleteClinicHandler implements ICommandHandler<SoftDeleteClinicCommand> {
  constructor(
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicQueryRepo: IClinicQueryRepository,
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
        const clinic = await this.clinicQueryRepo.findById(clinicId);
        if (!clinic) return;

        clinic.softDelete(actor?.userId);
        await this.clinicCommandRepo.update(clinic);
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
