import { z } from 'zod';

export const CreateClinicPaymentGatewaySchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),

  // Iyzico alt üye işyeri anahtarı doğrulaması (Boş string gönderimi engellenir)
  iyzicoSubMerchantKey: z
    .string()
    .min(1, 'Iyzico alt üye işyeri (Sub-Merchant) anahtarı zorunludur'),
});

export type CreateClinicPaymentGatewayProps = z.infer<
  typeof CreateClinicPaymentGatewaySchema
>;
