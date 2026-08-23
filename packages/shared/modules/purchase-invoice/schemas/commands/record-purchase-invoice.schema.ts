import { z } from 'zod';

/** Para birimi — @prisma/client'a bağlanmadan (frontend güvenliği) lokal enum. */
export const PurchaseInvoiceCurrencyEnum = z.enum(['TRY', 'USD', 'EUR', 'GBP']);

/**
 * Tedarikçiden alınan alış faturasını kaydeder. net + KDV tedarikçinin belgesinde
 * basılıdır; ikisi de açıkça alınır, grandTotal = net + vat hesaplanır.
 * Tedarikçi kimliği snapshot olarak taşınır (inventory modülü cross-module sorguya
 * bağlı değil) → finans carisi (320) bu bilgilerle garanti edilir.
 */
export const RecordPurchaseInvoiceSchema = z.object({
  supplierId: z.uuid(),
  supplierName: z.string().min(1),
  supplierTaxNumber: z.string().optional(),
  supplierTaxOffice: z.string().optional(),

  invoiceNumber: z.string().optional(),
  invoiceDate: z.coerce.date(),

  /**
   * Faturanın eşleştirileceği satın alma siparişi (opsiyonel). Verilirse sipariş
   * kilit altında doğrulanır (tedarikçi/klinik/para birimi uyumu + faturalanan
   * toplam sipariş tutarını aşamaz) ve siparişin faturalama durumu güncellenir.
   */
  purchaseOrderId: z.uuid().optional(),

  /** Karşı borç/gider hesabı: 150 (stok) | 770/760/740 (gider). */
  lineAccountCode: z.string().min(1).default('770'),
  vatRate: z.number().int().min(0).max(100),
  netTotal: z.number().nonnegative(),
  vatTotal: z.number().nonnegative(),
  currency: PurchaseInvoiceCurrencyEnum.default('TRY'),

  // organizationId ALINMAZ — clinicId'den türetilir (bkz. create-supplier).
  clinicId: z.uuid(),
});
