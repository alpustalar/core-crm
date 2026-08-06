import { ClinicException } from '@modules/organization/clinic/domain/entities/clinic-exception.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const CLINIC_EXCEPTION_COMMAND_REPOSITORY = Symbol(
  'IClinicExceptionCommandRepository'
);

export interface IClinicExceptionCommandRepository
  extends IBaseCommandRepository<ClinicException> {
  findExceptionByClinicAndDate(
    clinicId: string,
    date: Date
  ): Promise<ClinicException | null>;

  findExceptionsByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ClinicException[]>;
}
