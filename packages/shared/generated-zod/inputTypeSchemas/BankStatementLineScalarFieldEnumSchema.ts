import { z } from 'zod';

export const BankStatementLineScalarFieldEnumSchema = z.enum(['id','bankStatementId','bankAccountId','clinicId','organizationId','transactionDate','description','amount','balanceAfter','reference','counterpartyName','matchStatus','matchedRef','matchNote','reconciledById','reconciledAt','createdAt']);

export default BankStatementLineScalarFieldEnumSchema;
