import { ClinicAvailability } from '@shared';

export const CLINIC_AVAILABILITY_QUERY_REPOSITORY = Symbol(
  'IClinicAvailabilityQueryRepository'
);

export interface IClinicAvailabilityQueryRepository {
  findAllByClinicId(clinicId: string): Promise<ClinicAvailability[]>;
  findByClinicAndDay(
    clinicId: string,
    dayOfWeek: number
  ): Promise<ClinicAvailability | null>;
}
