import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteAppointmentsByOrganizationIdCommand } from './soft-delete-appointments-by-organization-id.command';
import { SoftDeleteAppointmentsByOrganizationIdCommandResponse } from './soft-delete-appointments-by-organization-id.response';
import { Inject } from '@nestjs/common';
import { InternalOnly } from '@common/decorators';
import {
  APPOINTMENT_EVENT_PUBLISHER,
  IAppointmentEventPublisher,
} from '@modules/clinical/appointment/domain/interfaces/appointment-event-publisher.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { AppointmentEventBulkScopes } from '@modules/clinical/appointment/domain/events/appointments-bulk-soft-deleted.event';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

@CommandHandler(SoftDeleteAppointmentsByOrganizationIdCommand)
export class SoftDeleteAppointmentsByOrganizationIdHandler implements ICommandHandler<
  SoftDeleteAppointmentsByOrganizationIdCommand,
  SoftDeleteAppointmentsByOrganizationIdCommandResponse
> {
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    @Inject(APPOINTMENT_EVENT_PUBLISHER)
    private readonly eventPublisher: IAppointmentEventPublisher,
    private readonly txManager: TransactionManager
  ) {}
  @InternalOnly()
  async execute(
    command: SoftDeleteAppointmentsByOrganizationIdCommand
  ): Promise<SoftDeleteAppointmentsByOrganizationIdCommandResponse> {
    const { organizationId } = command;

    // Bulk soft-delete (domain bypass, N+1 önlenir) + tek toplu event, veri
    // bütünlüğü için outbox . Bildirim/Redis temizliği
    // event'i tüketen listener + processor tarafından asenkron yürütülür.
    await this.txManager.outboxRun(async () => {
      const { count } =
        await this.appointmentRepo.softDeleteAllByOrganizationId(
          organizationId
        );

      this.eventPublisher.bulkSoftDeleted({
        scope: AppointmentEventBulkScopes.ORGANIZATION,
        organizationId,
        affectedCount: count,
      });
    });
  }
}
