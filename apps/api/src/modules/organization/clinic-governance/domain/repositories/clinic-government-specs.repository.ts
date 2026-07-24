import { ClinicGovernmentSpecs } from '../entities/clinic-government-specs.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const CLINIC_GOVERNMENT_SPECS_COMMAND_REPOSITORY = Symbol(
  'IClinicGovernmentSpecsCommandRepository'
);
export const CLINIC_GOVERNMENT_SPECS_QUERY_REPOSITORY = Symbol(
  'IClinicGovernmentSpecsQueryRepository'
);

export type IClinicGovernmentSpecsCommandRepository =
  IBaseCommandRepository<ClinicGovernmentSpecs> & {
    sync(
      clinicGovernmentSpecs: ClinicGovernmentSpecs
    ): Promise<ClinicGovernmentSpecs>;
  };

export interface IClinicGovernmentSpecsQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicGovernmentSpecs | null>;
}
