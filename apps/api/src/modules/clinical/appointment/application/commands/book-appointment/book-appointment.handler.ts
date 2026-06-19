import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BookAppointmentCommand } from './book-appointment.command';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentChecker } from '@modules/clinical/appointment/domain/services/appointment-checker.service';
import { BookAppointmentCommandResponse } from '@modules/clinical/appointment/application/commands/book-appointment/book-appointment.response';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ClinicCanBookOrThrowQuery } from '@modules/organization/clinic/application/queries/clinic-can-book-or-throw/clinic-can-book-or-throw.query';
import { ProviderCanBookOrThrowQuery } from '@modules/clinical/provider/application/queries/provider-can-book-or-throw/provider-can-book-or-throw.query';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(BookAppointmentCommand)
export class BookAppointmentHandler
  implements
    ICommandHandler<BookAppointmentCommand, BookAppointmentCommandResponse>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    private readonly appointmentChecker: AppointmentChecker,
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
    } = dto;

    const endTime = Appointment.calculateEndTimeOrThrow(
      startTime,
      dtoEndTime,
      duration
    );

    await Promise.all([
      this.queryBus.execute(
        new ClinicCanBookOrThrowQuery(clinicId, startTime, endTime)
      ),
      this.queryBus.execute(
        new ProviderCanBookOrThrowQuery(providerId, startTime, endTime)
      ),
    ]);

    await this.appointmentChecker.noConflictOrThrow({
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
    });

    return this.transactionManager.run(async () => {
      const saved = await this.appointmentRepo.save(appointment);
      return saved.id;
    });
  }
}
