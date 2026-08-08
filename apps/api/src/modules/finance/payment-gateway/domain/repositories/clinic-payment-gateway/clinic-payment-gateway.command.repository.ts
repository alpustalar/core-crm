import { ClinicPaymentGateway } from '@modules/finance/payment-gateway/domain/entities/clinic-payment-gateway.entity';

export const CLINIC_PAYMENT_GATEWAY_COMMAND_REPOSITORY = Symbol(
  'IClinicPaymentGatewayCommandRepository'
);

export interface IClinicPaymentGatewayCommandRepository {
  /**
   * Ayar satırını yazma tarafı için yükler (varsa güncellenir, yoksa üretilir).
   * Okuma doğrudan upsert kararını beslediği için Command Context'e aittir.
   */
  findByClinicId(clinicId: string): Promise<ClinicPaymentGateway | null>;

  /** clinicId unique → get-or-create (upsert). */
  upsertByClinicId(entity: ClinicPaymentGateway): Promise<ClinicPaymentGateway>;
}
