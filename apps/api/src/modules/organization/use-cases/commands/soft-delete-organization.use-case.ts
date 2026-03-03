import { OrganizationRepository } from '../../repositories/organization.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORGANIZATION_EVENTS } from '@common/constants';
import { OrganizationSoftDeleteEvent } from '@common/events';
import { PrismaClient } from '@prisma/client';
import { ActorContext } from '@common/interfaces';
import { SoftDeleteClinicsByOrganizationIdUseCase } from '@modules/clinic/use-cases';

export class SoftDeleteOrganizationUseCase {
  constructor(
    private readonly organizationRepo: OrganizationRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaClient,
    private readonly softDeleteClinicsByOrganizationId: SoftDeleteClinicsByOrganizationIdUseCase
  ) {}

  async execute(organizationId: string, actor: ActorContext) {
    const deletedOrganization = await this.prisma.$transaction(async (tx) => {
      const org = await this.organizationRepo.softDelete(organizationId, tx);

      await this.softDeleteClinicsByOrganizationId.execute(
        organizationId,
        actor.userId,
        tx
      );
      return org;
    });

    if (deletedOrganization) {
      this.eventEmitter.emit(
        ORGANIZATION_EVENTS.SOFT_DELETED,
        new OrganizationSoftDeleteEvent({
          organizationId: deletedOrganization.id,
          userId: actor.userId,
          organizationName: deletedOrganization.name,
        })
      );
    }
  }
}
