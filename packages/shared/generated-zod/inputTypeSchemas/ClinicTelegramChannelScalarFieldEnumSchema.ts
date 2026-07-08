import { z } from 'zod';

export const ClinicTelegramChannelScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','provider','status','botTokenEnc','botUsername','webhookSecret','phoneNumber','mtprotoSessionEnc','lastError','createdAt','updatedAt']);

export default ClinicTelegramChannelScalarFieldEnumSchema;
