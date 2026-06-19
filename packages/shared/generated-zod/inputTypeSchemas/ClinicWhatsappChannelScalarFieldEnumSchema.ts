import { z } from 'zod';

export const ClinicWhatsappChannelScalarFieldEnumSchema = z.enum(['id','phoneNumberId','wabaId','displayPhoneNumber','accessToken','verifyToken','isActive','clinicId','organizationId','createdAt','updatedAt']);

export default ClinicWhatsappChannelScalarFieldEnumSchema;
