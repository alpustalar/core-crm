import { z } from 'zod';
import { RegisterClinicSubMerchantSchema } from '../schemas/register-submerchant.schema';

export type RegisterClinicSubMerchant = z.infer<typeof RegisterClinicSubMerchantSchema>;
