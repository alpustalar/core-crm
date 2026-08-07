import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { ClinicHealthTourismConfig } from '@modules/crm/health-tourism/config/domain/entities/clinic-health-tourism-config.entity';

export const CLINIC_HEALTH_TOURISM_CONFIG_COMMAND_REPOSITORY = Symbol(
  'IClinicHealthTourismConfigCommandRepository'
);

export interface IClinicHealthTourismConfigCommandRepository
  extends IBaseCommandRepository<ClinicHealthTourismConfig> {
  /** clinicId unique → upsert tabanlı kayıt. */
  sync(entity: ClinicHealthTourismConfig): Promise<ClinicHealthTourismConfig>;

  /**
   * Ayar satırını yazma tarafı için yükler (varsa güncellenir, yoksa üretilir).
   * Okuma doğrudan upsert kararını beslediği için Command Context'e aittir.
   */
  findByClinicId(clinicId: string): Promise<ClinicHealthTourismConfig | null>;
}
