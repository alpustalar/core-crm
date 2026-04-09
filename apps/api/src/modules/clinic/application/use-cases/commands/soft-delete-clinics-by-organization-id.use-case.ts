import { ClinicRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';
import { ContextService } from '@src/infrastructure/persistence/prisma/context.service';
import { Injectable } from '@nestjs/common';
import { CLINIC_EVENTS } from '@common/constants/events';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction.manager';
import { ClinicSoftDeletedEvent } from '@modules/clinic/domain/events';
import { ActorContext } from '@common/interfaces';

@Injectable()
export class SoftDeleteClinicsByOrganizationIdUseCase {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    private readonly contextService: ContextService,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(organizationId: string, actor?: ActorContext) {
    await this.transactionManager.run(async () => {
      const clinics =
        await this.clinicRepo.findManyByOrganizationId(organizationId);
      if (clinics.length === 0) return;

      await this.clinicRepo.softDeleteByOrganizationId(organizationId);

      clinics.forEach((clinic) => {
        this.contextService.addEvent(
          CLINIC_EVENTS.SOFT_DELETED,
          new ClinicSoftDeletedEvent({
            clinicId: clinic.id,
            organizationId,
            userId: actor?.userId,
            source: actor?.source,
          })
        );
      });
    });
  }
}
