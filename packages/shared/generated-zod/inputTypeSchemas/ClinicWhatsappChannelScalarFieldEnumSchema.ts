import { z } from 'zod';

export const ClinicWhatsappChannelScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','phoneNumberId','wabaId','displayPhoneNumber','accessToken','verifyToken','isActive','registrationPin','registeredAt','tokenExpiresAt','qualityRating','messagingTier','createdAt','updatedAt']);

export default ClinicWhatsappChannelScalarFieldEnumSchema;
