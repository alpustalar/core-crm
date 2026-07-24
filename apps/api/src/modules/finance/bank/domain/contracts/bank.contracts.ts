import { z } from 'zod';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { BankAccountStatusSchema } from '@input-type-schemas/BankAccountStatusSchema';
import { BankStatementLineMatchStatusSchema } from '@input-type-schemas/BankStatementLineMatchStatusSchema';
import { Pagination } from '@shared/common';
import { BankStatement as IBankStatement } from '@model-schema/BankStatementSchema';
import { BankStatementLine as IBankStatementLine } from '@model-schema/BankStatementLineSchema';

// ==========================================
// BANKA HESABI (BANK ACCOUNT) — Props
// clinicId/organizationId bağlamdan (actor) gelir.
// ==========================================

export const CreateBankAccountSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  name: z.string().min(1),
  bankName: z.string().min(1),
  iban: z.string().nullable().optional(),
  accountNo: z.string().nullable().optional(),
  currency: CurrencySchema.optional(),
  openingBalance: z.number().optional(),
});
export type CreateBankAccountProps = z.infer<typeof CreateBankAccountSchema>;

// ==========================================
// EKSTRE (BANK STATEMENT) — Import Props
// ==========================================

export const BankStatementLineInputSchema = z.object({
  transactionDate: z.coerce.date(),
  description: z.string().min(1),
  amount: z.number(), // imzalı: + giriş / − çıkış
  balanceAfter: z.number().nullable().optional(),
  reference: z.string().nullable().optional(),
  counterpartyName: z.string().nullable().optional(),
});
export type BankStatementLineInput = z.infer<
  typeof BankStatementLineInputSchema
>;

export const ImportBankStatementSchema = z.object({
  id: z.uuid().optional(),
  bankAccountId: z.uuid(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  openingBalance: z.number().nullable().optional(),
  closingBalance: z.number().nullable().optional(),
  fileName: z.string().nullable().optional(),
  importedById: z.uuid(),
  lines: z.array(BankStatementLineInputSchema).min(1),
});
export type ImportBankStatementProps = z.infer<
  typeof ImportBankStatementSchema
>;

// 1. Mutabakat Durum Enum'ı
export const ReconcileMatchStatusSchema = z.enum([
  'MATCHED',
  'IGNORED',
  'UNMATCHED',
]);

// 2. Reconcile Line Input Şeması
export const ReconcileLineInputSchema = z
  .object({
    matchStatus: ReconcileMatchStatusSchema,

    // Eğer durum MATCHED ise matchedRef zorunlu olmalı, IGNORED/UNMATCHED ise null/undefined olabilir
    matchedRef: z.string().nullable().optional(),
    matchNote: z
      .string()
      .max(500, 'Mutabakat notu 500 karakteri geçemez')
      .nullable()
      .optional(),

    reconciledById: z.string().uuid('Geçerli bir kullanıcı ID olmalıdır'),
  })
  .refine(
    (data) => {
      // İş Kuralı: Eğer durum MATCHED ise matchedRef boş olamaz
      return !(
        data.matchStatus === 'MATCHED' &&
        (!data.matchedRef || data.matchedRef.trim() === '')
      );
    },
    {
      message:
        'Eşleşti (MATCHED) durumundaki işlemler için eşleşme referansı (matchedRef) zorunludur',
      path: ['matchedRef'],
    }
  );

export type ReconcileLineInput = z.infer<typeof ReconcileLineInputSchema>;

// ==========================================
// Read-model filtreleri
// ==========================================

export const FindBankAccountsFilterSchema = z.object({
  clinicId: z.uuid(),
  status: BankAccountStatusSchema.optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindBankAccountsFilter = z.infer<
  typeof FindBankAccountsFilterSchema
>;

export const FindBankStatementsFilterSchema = z.object({
  clinicId: z.uuid(),
  bankAccountId: z.uuid().optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindBankStatementsFilter = z.infer<
  typeof FindBankStatementsFilterSchema
>;

export const FindStatementLinesFilterSchema = z.object({
  bankStatementId: z.uuid(),
  matchStatus: BankStatementLineMatchStatusSchema.optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindStatementLinesFilter = z.infer<
  typeof FindStatementLinesFilterSchema
>;

// ==========================================
// Persistence read-model'leri
// ==========================================

export type BankStatementWithLines = IBankStatement & {
  lines: IBankStatementLine[];
};

/** Bir ekstrenin mutabakat özeti — satır sayıları + tutar toplamları (string). */
export interface ReconciliationSummary {
  bankStatementId: string;
  totalLines: number;
  matchedCount: number;
  unmatchedCount: number;
  ignoredCount: number;
  statementNet: string; // tüm satır tutar toplamı
  matchedNet: string; // MATCHED satır toplamı
  unmatchedNet: string; // UNMATCHED satır toplamı
}

export const StatementLineImportPropsSchema = z.object({
  id: z.uuid().optional(),
  bankStatementId: z.uuid('Geçerli bir banka ekstresi ID olmalıdır'),
  bankAccountId: z.uuid('Geçerli bir banka hesabı ID olmalıdır'),
  clinicId: z.uuid('Geçerli bir klinik ID olmalıdır'),
  organizationId: z.uuid('Geçerli bir organizasyon ID olmalıdır'),
  transactionDate: z.date(),
  description: z.string().min(1, 'Açıklama alanı boş olamaz').trim(),

  // Tutar: Finansal işlemlerde kuruş hassasiyeti için number kontrolü
  amount: z.number({ error: 'Tutar sayısal olmalıdır' }),

  balanceAfter: z.number().nullable().optional(),
  reference: z.string().nullable().optional(),
  counterpartyName: z.string().nullable().optional(),
});

export type StatementLineImportProps = z.infer<
  typeof StatementLineImportPropsSchema
>;
