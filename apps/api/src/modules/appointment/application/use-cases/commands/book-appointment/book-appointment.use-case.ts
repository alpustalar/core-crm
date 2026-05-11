import { Inject, Injectable } from '@nestjs/common';
import { AppointmentChecker } from '@modules/appointment/domain/services/appointment-checker.service';
import { AppointmentSlotService } from '@modules/appointment/domain/services/appointment-slot.service';
import { BookAppointmentDto } from '@shared';
import { AppointmentPrismaMapper } from '@modules/appointment/infrastructure/persistence/prisma/mapper/appointment-prisma.mapper';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { ClinicModuleApi } from '@modules/clinic/clinic-module.api';
import { ProviderModuleApi } from '@modules/provider/provider-module.api';

@Injectable()
export class BookAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly appointmentChecker: AppointmentChecker,
    private readonly appointmentSlotService: AppointmentSlotService,
    private readonly clinicModuleApi: ClinicModuleApi,
    private readonly providerModuleApi: ProviderModuleApi
  ) {}

  async execute(dto: BookAppointmentDto) {
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
      this.clinicModuleApi.assertCanBook({ clinicId, startTime, endTime }),
      this.providerModuleApi.assertCanBook({ providerId, startTime, endTime }),
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
