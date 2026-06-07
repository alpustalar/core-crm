import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteManyClinicsByOrganizationIdCommand } from './soft-delete-many-clinics-by-organization-id.command';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { ForbiddenException, Inject } from '@nestjs/common';
import {
  CLINIC_COMMAND_REPOSITORY,
  CLINIC_QUERY_REPOSITORY,
  IClinicCommandRepository,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import {
  CLINIC_EVENT_PUBLISHER,
  IClinicEventPublisher,
} from '@modules/organization/clinic/domain/interfaces/clinic.event-publisher.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

@CommandHandler(SoftDeleteManyClinicsByOrganizationIdCommand)
export class SoftDeleteManyClinicsByOrganizationIdHandler
  implements
    ICommandHandler<SoftDeleteManyClinicsByOrganizationIdCommand, void>
{
  constructor(
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicQueryRepo: IClinicQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(CLINIC_EVENT_PUBLISHER)
    private readonly clinicEventPublisher: IClinicEventPublisher,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: SoftDeleteManyClinicsByOrganizationIdCommand
  ): Promise<void> {
    const { organizationId, ctx } = command;

    const { source, actor } = ctx;

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
        await this.clinicQueryRepo.findManyByOrganizationId(organizationId);
      if (clinics.length === 0) return;

      await this.clinicCommandRepo.softDeleteManyClinicWithAnOrganizationId(
        organizationId
      );
    });
  }
}
