import { z } from 'zod';
import {
  CreateBankAccountSchema,
  ImportBankStatementSchema,
  ReconcileStatementLineSchema,
} from '../../schemas/commands';

export type CreateBankAccount = z.infer<typeof CreateBankAccountSchema>;
export type ImportBankStatement = z.infer<typeof ImportBankStatementSchema>;
export type ReconcileStatementLine = z.infer<
  typeof ReconcileStatementLineSchema
>;
