import { Injectable } from '@nestjs/common';
import {
  SoftDeleteAppointmentsByClinicIdUseCase,
  SoftDeleteAppointmentsByOrganizationIdUseCase,
} from '@modules/appointment/application/use-cases/commands';

@Injectable()
export class AppointmentModuleApi {
  constructor(
    private readonly softDeleteAppointmentsByClinicIdUseCase: SoftDeleteAppointmentsByClinicIdUseCase,
    private readonly softDeleteAppointmentsByOrganizationIdUseCase: SoftDeleteAppointmentsByOrganizationIdUseCase
  ) {}

  softDeleteAppointmentsByClinicId(clinicId: string) {
    return this.softDeleteAppointmentsByClinicIdUseCase.execute(clinicId);
  }

  softDeleteAppointmentsByOrganizationId(organizationId: string) {
    return this.softDeleteAppointmentsByOrganizationIdUseCase.execute(
      organizationId
    );
  }
}
