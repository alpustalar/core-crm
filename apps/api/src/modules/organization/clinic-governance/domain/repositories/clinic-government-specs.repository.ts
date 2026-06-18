import { ClinicGovernmentSpecs } from '../entities/clinic-government-specs.entity';

export const CLINIC_GOVERNMENT_SPECS_COMMAND_REPOSITORY = Symbol(
  'IClinicGovernmentSpecsCommandRepository'
);
export const CLINIC_GOVERNMENT_SPECS_QUERY_REPOSITORY = Symbol(
  'IClinicGovernmentSpecsQueryRepository'
);

export interface IClinicGovernmentSpecsCommandRepository {
  /** clinicId unique → upsert tabanlı kayıt. */
  save(entity: ClinicGovernmentSpecs): Promise<ClinicGovernmentSpecs>;
}

export interface IClinicGovernmentSpecsQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicGovernmentSpecs | null>;
}
