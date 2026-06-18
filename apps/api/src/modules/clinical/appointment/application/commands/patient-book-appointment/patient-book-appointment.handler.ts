import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PatientBookAppointmentCommand } from './patient-book-appointment.command';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentChecker } from '@modules/clinical/appointment/domain/services/appointment-checker.service';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ClinicCanBookOrThrowQuery } from '@modules/organization/clinic/application/queries/clinic-can-book-or-throw/clinic-can-book-or-throw.query';
import { ProviderCanBookOrThrowQuery } from '@modules/clinical/provider/application/queries/provider-can-book-or-throw/provider-can-book-or-throw.query';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(PatientBookAppointmentCommand)
export class PatientBookAppointmentHandler
  implements ICommandHandler<PatientBookAppointmentCommand, string>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    private readonly appointmentChecker: AppointmentChecker,
    private readonly queryBus: TSQueryBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: PatientBookAppointmentCommand): Promise<string> {
    const { dto, patient } = command;
    const {
      clinicId,
      providerId,
      startTime,
      duration,
      endTime: dtoEndTime,
      treatmentId,
      notes,
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
      patientId: patient.patientId,
      patientName: patient.patientName,
      patientPhone: patient.patientPhone,
      patientEmail: patient.patientEmail,
      providerId,
      clinicId,
      treatmentId,
      startTime,
      endTime,
      notes,
    });

    return this.transactionManager.run(async () => {
      const saved = await this.appointmentRepo.save(appointment);
      return saved.id;
    });
  }
}
