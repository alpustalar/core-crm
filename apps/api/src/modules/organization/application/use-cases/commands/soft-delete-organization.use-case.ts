import { OrganizationRepository } from '@modules/organization/infrastructure/persistence/prisma/repositories/organization.repository';
import { ActorContext } from '@common/interfaces';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction.manager';
import { ContextService } from '@src/infrastructure/persistence/prisma/context.service';
import { ORGANIZATION_EVENTS } from '@common/constants/events';
import { OrganizationSoftDeleteEvent } from '@modules/organization/domain/events';

export class SoftDeleteOrganizationUseCase {
  constructor(
    private readonly organizationRepo: OrganizationRepository,
    private readonly contextService: ContextService,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(organizationId: string, actor: ActorContext) {
    return await this.transactionManager.run(async () => {
      const organization =
        await this.organizationRepo.softDelete(organizationId);

      this.contextService.addEvent(
        ORGANIZATION_EVENTS.SOFT_DELETED,
        new OrganizationSoftDeleteEvent({
          organizationId,
          organizationName: organization.name,
          userId: actor.userId,
        })
      );
      return organization;
    });
  }
}
