import { ClinicPaymentGateway } from '../entities/clinic-payment-gateway.entity';

export const CLINIC_PAYMENT_GATEWAY_COMMAND_REPOSITORY = Symbol(
  'IClinicPaymentGatewayCommandRepository'
);
export const CLINIC_PAYMENT_GATEWAY_QUERY_REPOSITORY = Symbol(
  'IClinicPaymentGatewayQueryRepository'
);

export interface IClinicPaymentGatewayCommandRepository {
  /** clinicId unique → get-or-create (upsert). */
  upsertByClinicId(
    entity: ClinicPaymentGateway
  ): Promise<ClinicPaymentGateway>;
}

export interface IClinicPaymentGatewayQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicPaymentGateway | null>;
}
