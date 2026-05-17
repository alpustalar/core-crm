import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BookAppointmentCommand } from './book-appointment.command';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentChecker } from '@modules/appointment/domain/services/appointment-checker.service';
import { AppointmentSlotService } from '@modules/appointment/domain/services/appointment-slot.service';
import { ClinicModuleApi } from '@modules/clinic/clinic.module.api';
import { ProviderModuleApi } from '@modules/provider/provider-module.api';
import { AppointmentPrismaMapper } from '@modules/appointment/infrastructure/persistence/prisma/mapper/appointment-prisma.mapper';

@CommandHandler(BookAppointmentCommand)
export class BookAppointmentHandler
  implements ICommandHandler<BookAppointmentCommand>
{
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly appointmentChecker: AppointmentChecker,
    private readonly appointmentSlotService: AppointmentSlotService,
    private readonly clinicModuleApi: ClinicModuleApi,
    private readonly providerModuleApi: ProviderModuleApi
  ) {}

  async execute(command: BookAppointmentCommand): Promise<any> {
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
    const endTime = this.appointmentSlotService.calculateEndTime(
      startTime,
      dtoEndTime,
      duration
    );

    this.appointmentSlotService.assertFiveMinuteBoundary(startTime);
    this.appointmentSlotService.assertFiveMinuteBoundary(endTime);

    await Promise.all([
      this.clinicModuleApi.assertCanBookOrThrow({
        clinicId,
        startTime,
        endTime,
      }),
      this.providerModuleApi.assertCanBookOrThrow({
        providerId,
        startTime,
        endTime,
      }),
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

    return this.appointmentRepo.create(data);
  }
}
