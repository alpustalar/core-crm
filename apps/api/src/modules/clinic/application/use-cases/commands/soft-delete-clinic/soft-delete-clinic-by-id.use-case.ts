import { ContextService } from '@src/infrastructure/persistence/prisma/context/context.service';
import { Inject, Injectable } from '@nestjs/common';
import { ActorContext } from '@common/interfaces';
import { CLINIC_EVENTS } from '@src/domain/constants/events';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  CLINIC_REPO_TOKEN,
  IClinicRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';

@Injectable()
export class SoftDeleteClinicByIdUseCase {
  constructor(
    @Inject(CLINIC_REPO_TOKEN)
    private readonly clinicRepo: IClinicRepository,
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
