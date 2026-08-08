import { ClinicException } from '@shared';

export const CLINIC_EXCEPTION_QUERY_REPOSITORY = Symbol(
  'IClinicExceptionQueryRepository'
);

export interface IClinicExceptionQueryRepository {
  findExceptionsByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ClinicException[]>;

  findClosedExceptionByDate(
    clinicId: string,
    date: Date
  ): Promise<Partial<ClinicException> | null>;

  findExceptionByClinicAndDate(
    clinicId: string,
    date: Date
  ): Promise<ClinicException | null>;
}
