import { ClinicException } from '@modules/organization/clinic/domain/entities/clinic-exception.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const CLINIC_EXCEPTION_QUERY_REPOSITORY = Symbol(
  'IClinicExceptionQueryRepository'
);

export const CLINIC_EXCEPTION_COMMAND_REPOSITORY = Symbol(
  'IClinicExceptionCommandRepository'
);

export type IClinicExceptionCommandRepository =
  IBaseCommandRepository<ClinicException>;

export interface IClinicExceptionQueryRepository {
  findExceptionByClinicAndDate(
    clinicId: string,
    date: Date
  ): Promise<ClinicException | null>;

  findExceptionsByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ClinicException[]>;

  findClosedExceptionByDate(
    clinicId: string,
    date: Date
  ): Promise<Partial<ClinicException> | null>;
}
