import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteManyClinicsByOrganizationIdCommand } from './soft-delete-many-clinics-by-organization-id.command';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { Inject } from '@nestjs/common';
import {
  CLINIC_COMMAND_REPOSITORY,
  IClinicCommandRepository,
} from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  CLINIC_EVENT_PUBLISHER,
  IClinicEventPublisher,
} from '@modules/organization/clinic/domain/interfaces/clinic.event-publisher.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { CLINIC_EVENTS } from '@src/domain/constants/events';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';

@CommandHandler(SoftDeleteManyClinicsByOrganizationIdCommand)
export class SoftDeleteManyClinicsByOrganizationIdHandler
  implements
    ICommandHandler<SoftDeleteManyClinicsByOrganizationIdCommand, void>
{
  constructor(
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
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
      this.policyFactory
        .organization(actor, source)
        .evaluator.check(
          (p) => p.actorCanManageTargetOrganization(organizationId),
          'Bu işlem için yetkiniz bulunmamaktadır.'
        )
        .orThrow(CLINIC_EVENTS.SOFT_DELETED);
    }

    await this.transactionManager.run(async () => {
      await this.clinicCommandRepo.softDeleteManyClinicWithAnOrganizationId(
        organizationId
      );
      this.clinicEventPublisher.softDeleteClinicByOrganizationId({
        organizationId,
        actorId: actor.userId,
        action: LogAction.CLINIC_SOFT_DELETE,
        type: LogType.INFO,
      });
    });
  }
}
