import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BookAppointmentCommand } from './book-appointment.command';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentCheckerService } from '@modules/clinical/appointment/domain/services/appointment-checker.service';
import { BookAppointmentCommandResponse } from '@modules/clinical/appointment/application/commands/book-appointment/book-appointment.response';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TimeZoneSchema } from '@shared';
import { AssertClinicCanBookQuery } from '@modules/organization/clinic/application/queries/assert-clinic-can-book/assert-clinic-can-book.query';
import { AssertProviderCanBookQuery } from '@modules/clinical/provider/application/queries/assert-provider-can-book/assert-provider-can-book.query';

@CommandHandler(BookAppointmentCommand)
export class BookAppointmentHandler
  implements
    ICommandHandler<BookAppointmentCommand, BookAppointmentCommandResponse>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository,
    private readonly appointmentCheckerService: AppointmentCheckerService,
    private readonly queryBus: TSQueryBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: BookAppointmentCommand
  ): Promise<BookAppointmentCommandResponse> {
    const { dto } = command;
    const {
      providerId,
      clinicId,
      startTime,
      duration,
      endTime: dtoEndTime,
      patientName,
      patientPhone,
      patientEmail,
      treatmentId,
      notes,
      externalId,
      externalSystem,
      isConsultation,
    } = dto;

    const endTime = Appointment.calculateEndTime(
      startTime,
      dtoEndTime,
      duration
    ).orThrow();

    await Promise.all([
      this.queryBus.execute(
        new AssertClinicCanBookQuery(clinicId, startTime, endTime)
      ),
      this.queryBus.execute(
        new AssertProviderCanBookQuery(
          providerId,
          startTime,
          endTime,
          isConsultation
        )
      ),
    ]);

    await this.appointmentCheckerService.assertNoConflict({
      providerId,
      startTime,
      endTime,
    });

    const appointment = Appointment.book({
      patientName,
      patientPhone,
      patientEmail,
      providerId,
      clinicId,
      treatmentId: treatmentId ?? null,
      startTime,
      endTime,
      notes: notes ?? null,
      externalId: externalId ?? null,
      externalSystem: externalSystem ?? null,
      timezone: TimeZoneSchema.enum.Europe_Istanbul,
      isConsultation,
    });

    return this.transactionManager.run(async () => {
      const saved = await this.appointmentCommandRepo.create(appointment);
      return saved.id.value;
    });
  }
}
