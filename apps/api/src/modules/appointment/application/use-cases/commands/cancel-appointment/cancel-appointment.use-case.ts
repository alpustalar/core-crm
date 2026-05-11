import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { ActorContext } from '@common/interfaces';
import { AppointmentEntity } from '@modules/appointment/domain/entities/appointment.entity';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';

interface CancelAppointmentInput {
  appointmentId: string;
  cancelReason?: string;
}

@Injectable()
export class CancelAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(input: CancelAppointmentInput, actor: ActorContext) {
    const { appointmentId, cancelReason } = input;

    const rawAppointment = await this.appointmentRepo.findById(appointmentId);
    if (!rawAppointment) {
      throw new NotFoundException('Randevu bulunamadı.');
    }

    const appointment = new AppointmentEntity(rawAppointment);

    appointment.cancel(actor.userId, cancelReason);

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId),
        'Bu randevuya erişim yetkiniz yok.'
      )
      // TODO: event fırlat
      .orThrow();

    return this.appointmentRepo.cancelById(appointmentId, {
      canceledBy: actor.userId,
      cancelReason,
    });
  }
}
