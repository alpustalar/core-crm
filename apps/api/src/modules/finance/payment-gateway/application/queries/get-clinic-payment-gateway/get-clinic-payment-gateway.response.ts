import { QueryResponse } from '@shared/common/response/response.interface';

export interface ClinicPaymentGatewayView {
  clinicId: string;
  iyzicoSubMerchantKey: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Gateway kayıtlı değilse data null döner. */
export type GetClinicPaymentGatewayResponse =
  QueryResponse<ClinicPaymentGatewayView | null>;
