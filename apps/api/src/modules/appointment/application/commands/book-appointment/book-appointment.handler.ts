import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BookAppointmentCommand } from './book-appointment.command';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentChecker } from '@modules/appointment/domain/services/appointment-checker.service';
import { AppointmentSlotService } from '@modules/appointment/domain/services/appointment-slot.service';
import { AppointmentPrismaMapper } from '@modules/appointment/infrastructure/persistence/prisma/mapper/appointment-prisma.mapper';
import { BookAppointmentCommandResponse } from '@modules/appointment/application/commands/book-appointment/book-appointment.response';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { AssertProviderCanBookOrThrowQuery } from '@modules/provider/application/queries/assert-provider-can-book/assert-provider-can-book-or-throw.query';
import { AssertClinicCanBookOrThrowQuery } from '@modules/clinic/application/queries/assert-clinic-can-book-or-throw/assert-clinic-can-book-or-throw.query';

@CommandHandler(BookAppointmentCommand)
export class BookAppointmentHandler
  implements
    ICommandHandler<BookAppointmentCommand, BookAppointmentCommandResponse>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    private readonly appointmentChecker: AppointmentChecker,
    private readonly appointmentSlotService: AppointmentSlotService,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    command: BookAppointmentCommand
  ): Promise<BookAppointmentCommandResponse> {
    const { dto } = command;
    const {
      providerId,
      clinicId,
      startTime: startTimeDto,
      duration,
      endTime: dtoEndTime,
      ...rest
    } = dto;

    const startTime = new Date(startTimeDto);
    const endTime = this.appointmentSlotService.calculateEndTimeOrThrow(
      startTime,
      dtoEndTime,
      duration
    );

    this.appointmentSlotService.assertFifteenMinuteBoundaryOrThrow(startTime);
    this.appointmentSlotService.assertFifteenMinuteBoundaryOrThrow(endTime);

    await Promise.all([
      this.queryBus.execute(
        new AssertClinicCanBookOrThrowQuery(clinicId, startTime, endTime)
      ),
      this.queryBus.execute(
        new AssertProviderCanBookOrThrowQuery(providerId, startTime, endTime)
      ),
    ]);

    await this.appointmentChecker.assertNoConflictOrThrow({
      providerId,
      startTime,
      endTime,
    });

    const data = AppointmentPrismaMapper.toCreateInputFromBook({
      providerId,
      clinicId,
      startTime,
      endTime,
      ...rest,
    });

    const appointment = await this.appointmentRepo.create(data);
    return appointment.id;
  }
}
