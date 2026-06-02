import { createZodDto } from 'nestjs-zod';
import { RegisterClinicSubMerchantSchema } from '../schemas/register-submerchant.schema';

export class RegisterClinicSubMerchantDto extends createZodDto(
  RegisterClinicSubMerchantSchema
) {}
