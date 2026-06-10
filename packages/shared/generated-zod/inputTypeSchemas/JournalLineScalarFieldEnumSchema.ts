import { z } from 'zod';

export const JournalLineScalarFieldEnumSchema = z.enum(['id','entryId','accountId','partyId','debit','credit','currency','lineDesc']);

export default JournalLineScalarFieldEnumSchema;
