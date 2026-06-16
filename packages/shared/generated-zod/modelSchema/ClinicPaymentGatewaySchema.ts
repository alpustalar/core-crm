import { z } from 'zod';

/////////////////////////////////////////
// CLINIC PAYMENT GATEWAY SCHEMA
/////////////////////////////////////////

export const ClinicPaymentGatewaySchema = z.object({
  id: z.uuid(),
  iyzicoSubMerchantKey: z.string(),
  clinicId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicPaymentGateway = z.infer<typeof ClinicPaymentGatewaySchema>

export default ClinicPaymentGatewaySchema;
