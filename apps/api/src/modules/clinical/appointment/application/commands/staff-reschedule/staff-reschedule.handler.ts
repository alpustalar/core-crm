import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { StaffRescheduleCommand } from './staff-reschedule.command';
import { StaffRescheduleCommandResponse } from './staff-reschedule.response';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentCommandRepository,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentChecker } from '@modules/clinical/appointment/domain/services/appointment-checker.service';
import { AppointmentSlotService } from '@modules/clinical/appointment/domain/services/appointment-slot.service';

@CommandHandler(StaffRescheduleCommand)
export class StaffRescheduleHandler
  implements
    ICommandHandler<StaffRescheduleCommand, StaffRescheduleCommandResponse>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository,
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentQueryRepo: IAppointmentQueryRepository,
    private readonly appointmentChecker: AppointmentChecker,
    private readonly appointmentSlotService: AppointmentSlotService
  ) {}

  async execute(
    command: StaffRescheduleCommand
  ): Promise<StaffRescheduleCommandResponse> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    const {
      appointmentId,
      providerId: dtoProviderId,
      startTime: startTimeDto,
      endTime: dtoEndTime,
      duration,
      notes,
      treatmentId,
    } = dto;

    const startTime = new Date(startTimeDto);
    const endTime = this.appointmentSlotService.calculateEndTimeOrThrow(
      startTime,
      dtoEndTime,
      duration
    );

    this.appointmentSlotService.fifteenMinuteBoundaryOrThrow(startTime);
    this.appointmentSlotService.fifteenMinuteBoundaryOrThrow(endTime);

    const appointment = await this.appointmentQueryRepo.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Randevu bulunamadı.');
    }

    if (appointment.clinicId !== actor.clinicId) {
      throw new ForbiddenException(
        'Bu randevuyu yeniden zamanlamak için yetkiniz yok.'
      );
    }

    const effectiveProviderId = dtoProviderId ?? appointment.providerId;

    await this.appointmentChecker.noConflictOrThrow({
      providerId: effectiveProviderId,
      startTime,
      endTime,
      ignoreAppointmentId: appointmentId,
    });

    appointment.reschedule(
      startTime,
      endTime,
      effectiveProviderId,
      notes,
      treatmentId
    );

    await this.appointmentCommandRepo.save(appointment);
  }
}
