import { ClinicHealthTourismConfig } from '../entities/clinic-health-tourism-config.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const CLINIC_HEALTH_TOURISM_CONFIG_COMMAND_REPOSITORY = Symbol(
  'IClinicHealthTourismConfigCommandRepository'
);
export const CLINIC_HEALTH_TOURISM_CONFIG_QUERY_REPOSITORY = Symbol(
  'IClinicHealthTourismConfigQueryRepository'
);

export interface IClinicHealthTourismConfigCommandRepository
  extends IBaseCommandRepository<ClinicHealthTourismConfig> {
  /** clinicId unique → upsert tabanlı kayıt. */
  sync(entity: ClinicHealthTourismConfig): Promise<ClinicHealthTourismConfig>;
}

export interface IClinicHealthTourismConfigQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicHealthTourismConfig | null>;
}
