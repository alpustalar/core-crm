import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CLINIC_COMMAND_REPOSITORY,
  IClinicCommandRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { SoftDeleteClinicCommand } from '@modules/clinic/application/commands/soft-delete-clinic/soft-delete-clinic.use-case-by-id.command';
import { Inject } from '@nestjs/common';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/domain/interfaces/context.service.interface';

/* eslint-disable */
@CommandHandler(SoftDeleteClinicCommand)
export class SoftDeleteClinicHandler
  implements ICommandHandler<SoftDeleteClinicCommand>
{
  /* eslint-enable */
  constructor(
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: SoftDeleteClinicCommand) {
    const { clinicId, actor } = command;

    return await this.transactionManager.run(async () => {
      const removedClinic = await this.clinicCommandRepo.softDelete(clinicId);

      if (!removedClinic) return null;

      this.contextService.addEvent({
        clinicId: removedClinic.id,
        clinicName: removedClinic.name,
        organizationId: removedClinic.organizationId,
        userId: actor?.userId,
      });

      return removedClinic;
    });
  }
}
