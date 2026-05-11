import { Inject, Injectable } from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';

@Injectable()
export class SoftDeleteAppointmentsByClinicIdUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository
  ) {}

  async execute(clinicId: string) {
    return this.appointmentRepo.softDeleteAllAppointmentsByClinicId(clinicId);
  }
}
