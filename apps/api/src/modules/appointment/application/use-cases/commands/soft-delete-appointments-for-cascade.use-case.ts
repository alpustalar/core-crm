import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '@modules/appointment/infrastructure/persistence/prisma/repositories/appointment.repository';

@Injectable()
export class SoftDeleteAppointmentsForCascadeUseCase {
  constructor(private readonly appointmentRepo: AppointmentRepository) {}

  async execute(clinicId: string) {
    return this.appointmentRepo.softDeleteAllAppointmentsByClinicId(clinicId);
  }
}
