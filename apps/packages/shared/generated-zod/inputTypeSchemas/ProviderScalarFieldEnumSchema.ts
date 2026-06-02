import { z } from 'zod';

export const ProviderScalarFieldEnumSchema = z.enum(['id','publicPhone','publicEmail','diplomaNo','hlrNo','isActive','canAcceptExamination','operationMode','createdAt','updatedAt','deletedAt','clinicId','userId','sectorId','providerTitleId','providerSpecialtyId']);

export default ProviderScalarFieldEnumSchema;
