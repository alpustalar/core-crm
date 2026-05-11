import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { addMinutes } from 'date-fns';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentChecker } from '@modules/appointment/domain/services/appointment-checker.service';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { ActorContext } from '@common/interfaces';
import { StaffRescheduleDto } from '@shared';

interface StaffRescheduleInput extends StaffRescheduleDto {
  appointmentId: string;
}

@Injectable()
export class StaffRescheduleUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly appointmentChecker: AppointmentChecker,
    private readonly policyFactory: PolicyFactory,
    private readonly auditLog: AuditLogService
  ) {}

  async execute(input: StaffRescheduleInput, actor: ActorContext) {
    const {
      appointmentId,
      startTime: startTimeDto,
      endTime: dtoEndTime,
      duration,
      providerId: dtoProviderId,
      notes,
      treatmentId,
    } = input;

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Randevu bulunamadı.');
    }

    if (['CANCELLED', 'COMPLETED', 'NOSHOW'].includes(appointment.status)) {
      throw new BadRequestException(
        'İptal edilmiş, tamamlanmış veya gelmedi durumundaki randevular yeniden zamanlanamaz.'
      );
    }

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow();
    // TODO: event fırlat

    const start = new Date(startTimeDto);
    const endTime = this.resolveEndTime(start, dtoEndTime, duration);
    const providerId = dtoProviderId ?? appointment.providerId;

    await this.appointmentChecker.assertNoConflictOrThrow({
      providerId,
      startTime: start,
      endTime,
      ignoreAppointmentId: appointmentId,
    });

    return this.appointmentRepo.reschedule(appointmentId, {
      startTime: start,
      endTime,
      providerId,
      notes,
      treatmentId,
    });
  }

  private resolveEndTime(
    start: Date,
    dtoEndTime?: Date,
    duration?: number
  ): Date {
    if (dtoEndTime) return new Date(dtoEndTime);
    if (duration) return addMinutes(start, duration);
    throw new BadRequestException(
      'Randevu süresi veya bitiş zamanı belirlenemedi.'
    );
  }
}
