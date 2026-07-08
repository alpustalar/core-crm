import { z } from 'zod';

export const MetaAdAccountScalarFieldEnumSchema = z.enum(['id','clinicId','adAccountId','pageId','accessToken','businessName','isActive','tokenExpiresAt','lastSyncAt','createdAt','updatedAt']);

export default MetaAdAccountScalarFieldEnumSchema;
