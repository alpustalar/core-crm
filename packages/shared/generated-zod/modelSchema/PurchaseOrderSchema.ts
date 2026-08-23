import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { PurchaseOrderStatusSchema } from '../inputTypeSchemas/PurchaseOrderStatusSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'
import { PurchaseOrderBillingStatusSchema } from '../inputTypeSchemas/PurchaseOrderBillingStatusSchema'

/////////////////////////////////////////
// PURCHASE ORDER SCHEMA
/////////////////////////////////////////

export const PurchaseOrderSchema = z.object({
  status: PurchaseOrderStatusSchema,
  currency: CurrencySchema,
  billingStatus: PurchaseOrderBillingStatusSchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  supplierId: z.string(),
  purchaseRequestId: z.string().nullable(),
  orderDate: z.coerce.date(),
  expectedDate: z.coerce.date().nullable(),
  netTotal: decimalSchema("Field 'netTotal' must be a Decimal. Location: ['Models', 'PurchaseOrder']"),
  vatTotal: decimalSchema("Field 'vatTotal' must be a Decimal. Location: ['Models', 'PurchaseOrder']"),
  grandTotal: decimalSchema("Field 'grandTotal' must be a Decimal. Location: ['Models', 'PurchaseOrder']"),
  /**
   * Bu siparişe eşleştirilmiş alış faturalarının KDV dahil toplamı. Kaynak-doğru
   * veri `purchase_invoices.purchase_order_id`'dir; bu kolon o toplamın sayacıdır
   * ve eşleştirme/eşleştirme-kaldırma ile AYNI transaction'da (sipariş satırı
   * FOR UPDATE kilitliyken) güncellenir — bu yüzden sapmaz.
   */
  invoicedTotal: decimalSchema("Field 'invoicedTotal' must be a Decimal. Location: ['Models', 'PurchaseOrder']"),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>

export default PurchaseOrderSchema;
