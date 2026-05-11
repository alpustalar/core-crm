import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { ActorContext } from '@common/interfaces';
import { Pagination } from '@shared';

@Injectable()
export class GetActionRequiredUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(pagination: Pagination, actor: ActorContext) {
    if (!actor.clinicId) {
      throw new BadRequestException('Actor için klinik tanımlanmamış.');
    }

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(actor.clinicId!),
        'Bu kliniğe ait randevulara erişim yetkiniz yok.'
      )
      .orThrow();

    return this.appointmentRepo.findActionRequired(actor.clinicId, pagination);
  }
}
