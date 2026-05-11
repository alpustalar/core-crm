import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { ActorContext } from '@common/interfaces';

@Injectable()
export class CompleteAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(appointmentId: string, actor: ActorContext) {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Randevu bulunamadı.');
    }

    if (appointment.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Yalnızca onaylanmış randevular tamamlanabilir.'
      );
    }

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow();

    return this.appointmentRepo.changeStatusById(appointmentId, 'COMPLETED');
  }
}
