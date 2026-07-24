import { z } from 'zod';

/**
 * Banka ekstresi import (API'siz). Frontend CSV'yi parse edip satırları JSON
 * olarak yollar; amount imzalıdır (+ giriş / − çıkış).
 */
export const ImportBankStatementSchema = z.object({
  bankAccountId: z.uuid(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  openingBalance: z.number().nullable().optional(),
  closingBalance: z.number().nullable().optional(),
  fileName: z.string().nullable().optional(),
  lines: z
    .array(
      z.object({
        transactionDate: z.coerce.date(),
        description: z.string().min(1),
        amount: z.number(),
        balanceAfter: z.number().nullable().optional(),
        reference: z.string().nullable().optional(),
        counterpartyName: z.string().nullable().optional(),
      })
    )
    .min(1),
});
