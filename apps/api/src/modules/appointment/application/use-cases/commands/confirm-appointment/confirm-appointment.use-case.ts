import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { ActorContext } from '@common/interfaces';
import { AppointmentEntity } from '@modules/appointment/domain/entities/appointment.entity';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class ConfirmAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(appointmentId: string, actor: ActorContext) {
    const rawAppointment = await this.appointmentRepo.findById(appointmentId);
    if (!rawAppointment) {
      throw new NotFoundException('Randevu bulunamadı.');
    }

    const appointment = new AppointmentEntity(rawAppointment);

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(rawAppointment.clinicId),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow();

    appointment.confirm();

    return this.appointmentRepo.changeStatusById(
      appointmentId,
      AppointmentStatus.CONFIRMED
    );
  }
}
