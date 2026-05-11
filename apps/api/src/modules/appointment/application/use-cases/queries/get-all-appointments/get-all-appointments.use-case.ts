import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { ActorContext } from '@common/interfaces';
import { Pagination } from '@shared';

interface GetAllAppointmentsInput {
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
}

// Klinik genelindeki tüm randevuların takvim görünümü.
// clinicId actor'den gelir.
@Injectable()
export class GetAllAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(input: GetAllAppointmentsInput, actor: ActorContext) {
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

    return this.appointmentRepo.findClinicCalendar({
      clinicId: actor.clinicId,
      startDate: input.startDate,
      endDate: input.endDate,
      pagination: input.pagination,
    });
  }
}
