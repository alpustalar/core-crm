import { ClinicAvailability } from '@modules/organization/clinic/domain/entities/clinic-availability.entity';

export const CLINIC_AVAILABILITY_QUERY_REPOSITORY = Symbol(
  'IClinicAvailabilityQueryRepository'
);

export interface IClinicAvailabilityQueryRepository {
  findByClinicAndDay(
    clinicId: string,
    dayOfWeek: number
  ): Promise<ClinicAvailability | null>;

  findAllByClinicId(clinicId: string): Promise<ClinicAvailability[]>;
}
