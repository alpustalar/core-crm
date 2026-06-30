import { z } from 'zod';

export const ClinicTelegramChannelScalarFieldEnumSchema = z.enum(['id','provider','status','botTokenEnc','botUsername','webhookSecret','phoneNumber','mtprotoSessionEnc','lastError','clinicId','organizationId','createdAt','updatedAt']);

export default ClinicTelegramChannelScalarFieldEnumSchema;
