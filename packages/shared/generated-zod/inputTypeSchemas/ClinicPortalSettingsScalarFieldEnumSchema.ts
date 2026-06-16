import { z } from 'zod';

export const ClinicPortalSettingsScalarFieldEnumSchema = z.enum(['id','apiKey','primaryColor','customTitle','clinicId','createdAt','updatedAt']);

export default ClinicPortalSettingsScalarFieldEnumSchema;
