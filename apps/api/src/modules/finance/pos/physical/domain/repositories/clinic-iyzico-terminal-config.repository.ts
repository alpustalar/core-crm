import { ClinicIyzicoTerminalConfig } from '@modules/finance/pos/physical/domain/entities/clinic-iyzico-terminal-config.entity';

export const CLINIC_IYZICO_TERMINAL_CONFIG_COMMAND_REPOSITORY = Symbol(
  'IClinicIyzicoTerminalConfigCommandRepository'
);
export const CLINIC_IYZICO_TERMINAL_CONFIG_QUERY_REPOSITORY = Symbol(
  'IClinicIyzicoTerminalConfigQueryRepository'
);

export interface IClinicIyzicoTerminalConfigCommandRepository {
  /** clinicId unique → get-or-create (upsert). */
  upsertByClinicId(
    entity: ClinicIyzicoTerminalConfig
  ): Promise<ClinicIyzicoTerminalConfig>;
}

export interface IClinicIyzicoTerminalConfigQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicIyzicoTerminalConfig | null>;
}
