import { OrganizationRepository } from '@modules/organization/infrastructure/persistence/prisma/repositories/organization.repository';
import { ActorContext } from '@common/interfaces';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { OrganizationEventPublisher } from '@modules/organization/infrastructure/events/publisher';

export class SoftDeleteOrganizationUseCase {
  constructor(
    private readonly organizationRepo: OrganizationRepository,
    private readonly transactionManager: TransactionManager,
    private readonly organizationEventPublisher: OrganizationEventPublisher
  ) {}

  async execute(organizationId: string, actor: ActorContext) {
    return await this.transactionManager.run(async () => {
      const organization =
        await this.organizationRepo.softDelete(organizationId);

      return organization;
    });
  }
}
