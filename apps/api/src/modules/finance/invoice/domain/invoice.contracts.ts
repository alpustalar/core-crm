import { z } from 'zod';
import { InvoiceStatusSchema } from '@input-type-schemas/InvoiceStatusSchema';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { InvoiceTriggers } from '@modules/finance/invoice/domain/constants/invoice-triggers';
import { Decimal } from 'decimal.js';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { EDocumentTypeSchema } from '@input-type-schemas/EDocumentTypeSchema';
import { EDocumentStatusSchema } from '@input-type-schemas/EDocumentStatusSchema';

export const InvoiceTriggerSchema = z.nativeEnum(InvoiceTriggers);
export type InvoiceTrigger = z.infer<typeof InvoiceTriggerSchema>;

// ==========================================
// 2. INVOICE (FATURA) SÖZLEŞMELERİ
// ==========================================

export const CreateInvoiceSchema = z.object({
  id: z.uuid(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  patientId: z.uuid(),
  appointmentId: z.uuid().nullable(),
  paymentId: z.uuid().nullable(),

  amount: z.number().positive("Fatura tutarı 0'dan büyük olmalıdır"),
  currency: CurrencySchema,
  vatRate: z.number().min(0),

  // Decimal türündeki mali hassas alanların CLAUDE.md zırhı:
  netTotal: z.custom<Decimal>((val) => val instanceof Decimal),
  vatTotal: z.custom<Decimal>((val) => val instanceof Decimal),

  status: InvoiceStatusSchema, // Orijinal fatura statü şeması

  invoiceNumber: z.string().optional(),
  issuedAt: z.date().optional(),
  providerRef: z.string().optional(),
  rawResponse: z.unknown().optional(),
});

export type CreateInvoiceProps = z.infer<typeof CreateInvoiceSchema>;

// ==========================================
// FATURA İŞLEM SÖZLEŞMELERİ
// ==========================================

// 1. FATURA DÜZENLEME SÖZLEŞMESİ
export const IssueInvoicePropsSchema = z.object({
  invoiceNumber: z.string().min(1, 'Fatura numarası zorunludur'),
  providerRef: z.string().min(1, 'Sağlayıcı referansı zorunludur'), // Örn: Vergi dairesi veya e-fatura servis referansı
  issuedAt: z.date(),
  rawResponse: z.any().optional(), // Servisten dönen ham veri (debug amaçlı)
  source: z.nativeEnum(LogSource).optional(),
  actorId: z.uuid('Geçerli bir actorId zorunludur').optional(),
});
export type IssueInvoiceEntityProps = z.infer<typeof IssueInvoicePropsSchema>;

// 2. FATURA İŞLEM HATASI SÖZLEŞMESİ
export const FailInvoicePropsSchema = z.object({
  reason: z.string().min(5, 'Hata nedeni en az 5 karakter olmalıdır'),
  source: z.nativeEnum(LogSource).optional(),
  actorId: z.uuid().optional(),
});
export type FailInvoiceEntityProps = z.infer<typeof FailInvoicePropsSchema>;

// 3. E-BELGE SONUÇ SÖZLEŞMESİ
export const ApplyEDocumentResultPropsSchema = z.object({
  documentType: EDocumentTypeSchema,
  uuid: z.uuid().nullable(), // E-belge merkezi (GİB) tarafından üretilen evrensel ID
  status: EDocumentStatusSchema,
  invoiceNumber: z.string().nullable().optional(),
});
export type ApplyEDocumentResultProps = z.infer<
  typeof ApplyEDocumentResultPropsSchema
>;
