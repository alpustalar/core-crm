import { Inject, Injectable } from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { Pagination } from '@shared';

@Injectable()
export class GetPatientAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository
  ) {}

  execute(patientId: string, pagination: Pagination) {
    return this.appointmentRepo.findByPatientId(pagination, patientId);
  }
}
