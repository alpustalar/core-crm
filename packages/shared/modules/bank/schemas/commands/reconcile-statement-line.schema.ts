import { z } from 'zod';
import BankStatementLineMatchStatusSchema from '@shared/generated-zod/inputTypeSchemas/BankStatementLineMatchStatusSchema';

/** Ekstre satırı mutabakatı: eşleştir (MATCHED) / yoksay (IGNORED) / geri al (UNMATCHED). */
export const ReconcileStatementLineSchema = z.object({
  matchStatus: BankStatementLineMatchStatusSchema,
  matchedRef: z.string().nullable().optional(),
  matchNote: z.string().nullable().optional(),
});
