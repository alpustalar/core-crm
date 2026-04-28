import { z } from 'zod';

export const ProviderScalarFieldEnumSchema = z.enum(['id','publicPhone','publicEmail','isActive','createdAt','updatedAt','clinicId','userId','sectorId','providerTitleId','providerSpecialtyId']);

export default ProviderScalarFieldEnumSchema;
