import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteManyClinicsByOrganizationIdCommand } from './soft-delete-many-clinics-by-organization-id.command';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { ForbiddenException, Inject } from '@nestjs/common';
import {
  CLINIC_REPO_TOKEN,
  IClinicRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import {
  CLINIC_EVENT_PUBLISHER_TOKEN,
  IClinicEventPublisher,
} from '@modules/clinic/domain/interfaces/clinic.event-publisher.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

@CommandHandler(SoftDeleteManyClinicsByOrganizationIdCommand)
export class SoftDeleteManyClinicsByOrganizationIdHandler
  implements
    ICommandHandler<SoftDeleteManyClinicsByOrganizationIdCommand, void>
{
  constructor(
    @Inject(CLINIC_REPO_TOKEN)
    private readonly clinicRepo: IClinicRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    private readonly policyFactory: IPolicyFactory,
    @Inject(CLINIC_EVENT_PUBLISHER_TOKEN)
    private readonly clinicEventPublisher: IClinicEventPublisher,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: SoftDeleteManyClinicsByOrganizationIdCommand
  ): Promise<void> {
    const { organizationId, context } = command;

    const { source, actor } = context;

    if (ExecutionPolicy.isUserInitiated(source)) {
      const isOwn = this.policyFactory
        .organization(actor)
        .policy.isOwnOrganization(organizationId);

      if (!isOwn) {
        throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır.');
      } else {
        // TODO: security logu için event fırlat
      }
    }
    await this.transactionManager.run(async () => {
      const clinics =
        await this.clinicRepo.findManyByOrganizationId(organizationId);
      if (clinics.length === 0) return;

      await this.clinicRepo.softDeleteManyClinicWithAnOrganizationId(
        organizationId
      );
    });
  }
}
