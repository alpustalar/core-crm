import { ClinicAiAgentConfig as IClinicAiAgentConfig } from '@shared';
import { ClinicAiAgentConfig } from '../entities/clinic-ai-agent-config.entity';

export const CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY = Symbol(
  'IClinicAiAgentConfigCommandRepository'
);
export const CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY = Symbol(
  'IClinicAiAgentConfigQueryRepository'
);

export interface IClinicAiAgentConfigCommandRepository {
  /** clinicId unique → get-or-create (upsert). */
  upsertByClinicId(
    entity: ClinicAiAgentConfig
  ): Promise<ClinicAiAgentConfig>;

  /**
   * Ayar satırını yazma tarafı için yükler (yoksa varsayılandan üretilip yazılır).
   * Okuma doğrudan bir mutasyonu beslediği için Command Context'e aittir.
   */
  findByClinicId(clinicId: string): Promise<ClinicAiAgentConfig | null>;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IClinicAiAgentConfigQueryRepository {
  findByClinicId(clinicId: string): Promise<IClinicAiAgentConfig | null>;
}
