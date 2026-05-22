import { ClinicAvailability, ClinicException } from '@shared';

export type IClinicAvailability = ClinicAvailability;
export type IClinicException = ClinicException;

export const CLINIC_AVAILABILITY_QUERY_REPOSITORY = Symbol(
  'IClinicAvailabilityQueryRepository'
);

export interface IClinicAvailabilityQueryRepository {
  findByClinicAndDay(
    clinicId: string,
    dayOfWeek: number
  ): Promise<IClinicAvailability | null>;

  findAllByClinicId(clinicId: string): Promise<IClinicAvailability[]>;

  findExceptionByClinicAndDate(
    clinicId: string,
    date: Date
  ): Promise<IClinicException | null>;

  findExceptionsByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IClinicException[]>;

  findClosedExceptionByDate(
    clinicId: string,
    date: Date
  ): Promise<Partial<IClinicException> | null>;
}
