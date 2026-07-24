import { z } from 'zod';
import {
  GetBankAccountsSchema,
  GetBankStatementsSchema,
} from '../../schemas/queries';

export type GetBankAccounts = z.infer<typeof GetBankAccountsSchema>;
export type GetBankStatements = z.infer<typeof GetBankStatementsSchema>;
