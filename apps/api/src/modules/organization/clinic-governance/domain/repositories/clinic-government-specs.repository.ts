import { ClinicGovernmentSpecs as IClinicGovernmentSpecs } from '@shared';
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
    /**
     * Ayar satırını yazma tarafı için yükler (varsa güncellenir, yoksa üretilir).
     * Okuma doğrudan upsert kararını beslediği için Command Context'e aittir.
     */
    findByClinicId(clinicId: string): Promise<ClinicGovernmentSpecs | null>;

    sync(
      clinicGovernmentSpecs: ClinicGovernmentSpecs
    ): Promise<ClinicGovernmentSpecs>;
  };

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IClinicGovernmentSpecsQueryRepository {
  findByClinicId(clinicId: string): Promise<IClinicGovernmentSpecs | null>;
}
