import { ClinicRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';
import { ContextService } from '@src/infrastructure/persistence/prisma/context.service';
import { Injectable } from '@nestjs/common';
import { ActorContext } from '@common/interfaces';
import { CLINIC_EVENTS } from '@common/constants/events';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction.manager';

@Injectable()
export class SoftDeleteClinicUseCase {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    private readonly contextService: ContextService,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(clinicId: string, actor?: ActorContext) {
    return await this.transactionManager.run(async () => {
      const removedClinic = await this.clinicRepo.softDelete(clinicId);

      if (!removedClinic) return null;

      this.contextService.addEvent(CLINIC_EVENTS.SOFT_DELETED, {
        clinicId: removedClinic.id,
        clinicName: removedClinic.name,
        organizationId: removedClinic.organizationId,
        userId: actor?.userId,
      });

      return removedClinic;
    });
  }
}
