import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateClinicCommand } from './update-clinic.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  CLINIC_COMMAND_REPOSITORY,
  CLINIC_QUERY_REPOSITORY,
  IClinicCommandRepository,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { CLINIC_EVENTS } from '@src/domain/constants/events';

@CommandHandler(UpdateClinicCommand)
export class UpdateClinicHandler implements ICommandHandler<
  UpdateClinicCommand,
  void
> {
  constructor(
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicQueryRepo: IClinicQueryRepository,
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateClinicCommand): Promise<void> {
    const { ctx, clinicId, data } = command.payload;

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check(
        (p) => p.actorCanManageTargetClinic(clinicId),
        'Klinik bulunamadı veya güncelleme yetkiniz yok.'
      )
      .orThrow(CLINIC_EVENTS.UPDATED);

    const clinic = await this.clinicQueryRepo.findById(clinicId);
    if (!clinic) throw new NotFoundException('Klinik bulunamadı.');

    await this.txManager.run(async () => {
      clinic.update(data);
      await this.clinicCommandRepo.update(clinic);
    });
  }
}
