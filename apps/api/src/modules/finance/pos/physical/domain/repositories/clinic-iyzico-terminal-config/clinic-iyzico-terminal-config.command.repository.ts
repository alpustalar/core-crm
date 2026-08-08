import { ClinicIyzicoTerminalConfig } from '@modules/finance/pos/physical/domain/entities/clinic-iyzico-terminal-config.entity';

export const CLINIC_IYZICO_TERMINAL_CONFIG_COMMAND_REPOSITORY = Symbol(
  'IClinicIyzicoTerminalConfigCommandRepository'
);

export interface IClinicIyzicoTerminalConfigCommandRepository {
  /** clinicId unique → get-or-create (upsert). */
  upsertByClinicId(
    entity: ClinicIyzicoTerminalConfig
  ): Promise<ClinicIyzicoTerminalConfig>;
  /**
   * Kayıt akışında "var mı, güncelle mi" kararını ve satış/iade/void/gün-sonu
   * çağrılarının merchant kimliğini besleyen okuma. İkisi de yazma tarafı
   * olduğu için Command Context'e aittir: replica gecikmesi iptal edilmiş
   * kimlikle para hareketi denemesine yol açardı.
   *
   * NOT: Query repo yok — bu satellite'in tek okuyucusu komut tarafıdır;
   * sırlar (clientSecret/password) hiçbir HTTP yanıtına çıkmaz.
   */
  findByClinicId(clinicId: string): Promise<ClinicIyzicoTerminalConfig | null>;
}
