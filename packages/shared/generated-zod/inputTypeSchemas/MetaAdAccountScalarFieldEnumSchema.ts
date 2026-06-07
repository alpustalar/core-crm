import { z } from 'zod';

export const MetaAdAccountScalarFieldEnumSchema = z.enum(['id','clinicId','adAccountId','accessToken','pageId','businessName','isActive','tokenExpiresAt','lastSyncAt','createdAt','updatedAt']);

export default MetaAdAccountScalarFieldEnumSchema;
