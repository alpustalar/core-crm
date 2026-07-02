import { z } from 'zod';

export const JournalLineScalarFieldEnumSchema = z.enum(['id','entryId','accountId','partyId','debit','credit','currency','originalDebit','originalCredit','originalCurrency','fxRate','lineDesc']);

export default JournalLineScalarFieldEnumSchema;
