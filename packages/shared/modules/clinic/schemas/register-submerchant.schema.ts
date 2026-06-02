import { z } from 'zod';

export const SubMerchantTypeSchema = z.enum([
  'PERSONAL',
  'PRIVATE_COMPANY',
  'LIMITED_OR_JOINT_STOCK_COMPANY',
]);

export const RegisterClinicSubMerchantSchema = z.object({
  subMerchantType: SubMerchantTypeSchema,
  legalCompanyTitle: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  gsmNumber: z.string().min(10),
  iban: z.string().min(26).max(34),
  identityNumber: z.string().min(10).max(11),
  address: z.string().min(5),
  taxOffice: z.string().optional(),
});
