import { z } from 'zod';

export const BankStatementScalarFieldEnumSchema = z.enum(['id','bankAccountId','clinicId','organizationId','periodStart','periodEnd','openingBalance','closingBalance','fileName','importedById','createdAt']);

export default BankStatementScalarFieldEnumSchema;
