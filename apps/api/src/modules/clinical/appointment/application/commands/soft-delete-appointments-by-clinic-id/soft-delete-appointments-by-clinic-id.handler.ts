import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteAppointmentsByClinicIdCommand } from './soft-delete-appointments-by-clinic-id.command';
import { SoftDeleteAppointmentsByClinicIdCommandResponse } from './soft-delete-appointments-by-clinic-id.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { InternalOnly } from '@common/decorators';
import {
  APPOINTMENT_EVENT_PUBLISHER,
  IAppointmentEventPublisher,
} from '@modules/clinical/appointment/domain/interfaces/appointment-event-publisher.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { AppointmentEventBulkScopes } from '@modules/clinical/appointment/domain/events/appointments-bulk-soft-deleted.event';

@CommandHandler(SoftDeleteAppointmentsByClinicIdCommand)
export class SoftDeleteAppointmentsByClinicIdHandler
  implements
    ICommandHandler<
      SoftDeleteAppointmentsByClinicIdCommand,
      SoftDeleteAppointmentsByClinicIdCommandResponse
    >
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    @Inject(APPOINTMENT_EVENT_PUBLISHER)
    private readonly eventPublisher: IAppointmentEventPublisher,
    private readonly txManager: TransactionManager
  ) {}

  @InternalOnly()
  async execute(
    command: SoftDeleteAppointmentsByClinicIdCommand
  ): Promise<SoftDeleteAppointmentsByClinicIdCommandResponse> {
    const { clinicId } = command;

    // Bulk soft-delete (domain bypass, N+1 önlenir) + tek toplu event, veri
    // bütünlüğü için outbox ile atomik mühürlenir. Bildirim/Redis temizliği
    // event'i tüketen listener + processor tarafından asenkron yürütülür.
    await this.txManager.outboxRun(async () => {
      const { count } =
        await this.appointmentRepo.softDeleteAllAppointmentsByClinicId(
          clinicId
        );

      this.eventPublisher.bulkSoftDeleted({
        scope: AppointmentEventBulkScopes.CLINIC,
        clinicId,
        affectedCount: count,
      });
    });
  }
}
