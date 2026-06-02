import { z } from 'zod';

export const ProviderScalarFieldEnumSchema = z.enum(['id','publicPhone','publicEmail','isActive','canAcceptExamination','createdAt','updatedAt','deletedAt','clinicId','userId','sectorId','providerTitleId','providerSpecialtyId']);

export default ProviderScalarFieldEnumSchema;
