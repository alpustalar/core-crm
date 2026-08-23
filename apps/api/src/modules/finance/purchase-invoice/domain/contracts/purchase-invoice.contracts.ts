import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
// Decimal.js kullanıyorsan: import { Decimal } from 'decimal.js';

export const CreatePurchaseInvoicePropsSchema = z.object({
  id: z.uuid('Geçerli bir fatura ID olmalıdır'),
  clinicId: z.uuid('Geçerli bir klinik ID olmalıdır'),
  organizationId: z.uuid('Geçerli bir organizasyon ID olmalıdır'),
  supplierId: z.uuid('Geçerli bir tedarikçi ID olmalıdır'),

  invoiceNumber: z.string().min(1, 'Fatura numarası boş olamaz').nullable(),
  invoiceDate: z.date(),
  lineAccountCode: z.string().min(1, 'Hesap kodu zorunludur'),

  /** Eşleştirildiği satın alma siparişi (opsiyonel — serbest fatura null kalır). */
  purchaseOrderId: z.uuid().nullable().optional(),

  // KDV oranı: 0 ile 100 arası (örn: 0.18 veya 18 gibi sistem tercihinize göre)
  vatRate: z.number().min(0).max(100),

  // Decimal alanları için Zod transformer
  netTotal: z.preprocess(
    (val) => (typeof val === 'string' ? new Decimal(val) : val),
    z.any()
  ),
  vatTotal: z.preprocess(
    (val) => (typeof val === 'string' ? new Decimal(val) : val),
    z.any()
  ),
  grandTotal: z.preprocess(
    (val) => (typeof val === 'string' ? new Decimal(val) : val),
    z.any()
  ),

  currency: CurrencySchema,
});

export type CreatePurchaseInvoiceProps = z.infer<
  typeof CreatePurchaseInvoicePropsSchema
>;
