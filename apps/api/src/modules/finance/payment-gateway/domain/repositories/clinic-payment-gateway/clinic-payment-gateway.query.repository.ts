import { ClinicPaymentGateway } from '@shared';

export const CLINIC_PAYMENT_GATEWAY_QUERY_REPOSITORY = Symbol(
  'IClinicPaymentGatewayQueryRepository'
);

export interface IClinicPaymentGatewayQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicPaymentGateway | null>;
}
