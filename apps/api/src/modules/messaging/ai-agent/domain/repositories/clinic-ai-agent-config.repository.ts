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
}

export interface IClinicAiAgentConfigQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicAiAgentConfig | null>;
}
