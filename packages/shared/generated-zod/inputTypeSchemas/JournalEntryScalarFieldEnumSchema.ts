import { z } from 'zod';

export const JournalEntryScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','periodId','entryNo','entryDate','description','status','eventId','reversedById','performedById','createdAt','updatedAt']);

export default JournalEntryScalarFieldEnumSchema;
