import { z } from 'zod';

export const ClinicPortalSettingsScalarFieldEnumSchema = z.enum(['id','clinicId','apiKey','customDomain','primaryColor','customTitle','allowOnlineBooking','showMedicalRecords','showFinancials','showRaysAndImages','createdAt','updatedAt']);

export default ClinicPortalSettingsScalarFieldEnumSchema;
