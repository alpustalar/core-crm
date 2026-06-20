// domain/contracts/e-document.contracts.ts
import { z } from 'zod';
import { EDocumentTypeSchema } from '@input-type-schemas/EDocumentTypeSchema';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { EDocumentStatusSchema } from '@input-type-schemas/EDocumentStatusSchema';

// ==========================================
// 1. YARDIMCI VE ALT ŞEMALAR (SUB-SCHEMAS)
// ==========================================

export const PartyTaxInfoSchema = z.object({
  taxId: z.string().nullable(), // VKN veya TCKN
  name: z.string().min(1, 'Firma/Kişi adı zorunludur'),
  isEInvoiceUser: z.boolean().optional(),
  alias: z.string().nullable().optional(), // e-Fatura posta kutusu etiketi
});
export type PartyTaxInfo = z.infer<typeof PartyTaxInfoSchema>;

export const EDocumentLineSchema = z.object({
  name: z.string().min(1, 'Kalem adı zorunludur'),
  quantity: z.number().positive(),
  unitPrice: z.string(), // Mali hassasiyet için string tutulmuştur
  vatRate: z.number(),
  vatAmount: z.string(),
  withholdingAmount: z.string().optional(),
});
export type EDocumentLine = z.infer<typeof EDocumentLineSchema>;

export const EDocumentTotalsSchema = z.object({
  net: z.string(),
  vat: z.string(),
  withholding: z.string().optional(),
  payable: z.string(),
});
export type EDocumentTotals = z.infer<typeof EDocumentTotalsSchema>;

// ==========================================
// 2. ANA PROPS VE RESPONSE SÖZLEŞMELERİ
// ==========================================

/** Çekirdeğin porta geçtiği belge isteği (doc 07 §3). Adapter'a özgü değildir. */
export const EDocumentRequestSchema = z.object({
  type: EDocumentTypeSchema,
  invoiceId: z.uuid(), // İç sistem faturası için z.uuid() kök metodu
  issueDate: z.date(),
  seller: PartyTaxInfoSchema,
  buyer: PartyTaxInfoSchema,
  lines: z.array(EDocumentLineSchema),
  totals: EDocumentTotalsSchema,
  currency: CurrencySchema,
  note: z.string().optional(),
});
export type EDocumentRequest = z.infer<typeof EDocumentRequestSchema>;

/** Portun döndürdüğü belge sonucu. Noop'ta documentType=INTERNAL, uuid=null. */
export const EDocumentResultSchema = z.object({
  documentType: EDocumentTypeSchema,
  uuid: z.uuid().nullable(), // ETTN genellikle UUID formatındadır, INTERNAL ise null
  status: EDocumentStatusSchema,
  invoiceNumber: z.string().nullable(), // Entegratörün atadığı Belge No (Örn: GIB20260000001)
  rawResponse: z.unknown().optional(), // Entegratörden dönen ham veri
});
export type EDocumentResult = z.infer<typeof EDocumentResultSchema>;

export const MailboxInfoSchema = z.object({
  isEInvoiceUser: z.boolean(),
  alias: z.string().optional(), // e-Fatura posta kutusu etiketi (Örn: urn:mail:defaultpk@firma.com)
});

export type MailboxInfo = z.infer<typeof MailboxInfoSchema>;
