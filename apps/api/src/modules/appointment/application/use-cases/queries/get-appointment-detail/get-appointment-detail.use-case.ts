import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { ActorContext } from '@common/interfaces';

@Injectable()
export class GetAppointmentDetailUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(appointmentId: string, actor: ActorContext) {
    const appointment =
      await this.appointmentRepo.findByIdWithDetails(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Randevu bulunamadı.');
    }

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow();

    return appointment;
  }
}
