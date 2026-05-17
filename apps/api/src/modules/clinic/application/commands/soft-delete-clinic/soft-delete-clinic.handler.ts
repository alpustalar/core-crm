import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CLINIC_REPO_TOKEN,
  IClinicRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';
import { ContextService } from '@src/infrastructure/context/context.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { SoftDeleteClinicCommand } from '@modules/clinic/application/commands/soft-delete-clinic/soft-delete-clinic.use-case-by-id.command';
import { Inject } from '@nestjs/common';

/* eslint-disable */
@CommandHandler(SoftDeleteClinicCommand)
export class SoftDeleteClinicHandler
  implements ICommandHandler<SoftDeleteClinicCommand>
{
  /* eslint-enable */
  constructor(
    @Inject(CLINIC_REPO_TOKEN)
    private readonly clinicRepo: IClinicRepository,
    private readonly contextService: ContextService,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: SoftDeleteClinicCommand) {
    const { clinicId, actor } = command;

    return await this.transactionManager.run(async () => {
      const removedClinic = await this.clinicRepo.softDelete(clinicId);

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
