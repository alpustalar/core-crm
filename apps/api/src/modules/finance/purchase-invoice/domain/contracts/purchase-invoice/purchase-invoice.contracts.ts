import { Decimal } from 'decimal.js';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

/**
 * PurchaseInvoice domain kontratları. Entity static `create()` girişi (Props).
 *
 * `netTotal`/`vatTotal`/`grandTotal` — `Money.create()`e doğrudan beslenir; VO
 * negatiflik/sonluluk denetimini zaten yapar (bkz. money.vo.ts refine'ları).
 * `vatRate` — `VatRate.create()` zaten yasal KDV oranlarını (0/1/10/20) zorunlu
 * kılar; 0–100 aralık kontrolünden daha katıdır.
 */
export interface CreatePurchaseInvoiceProps {
  id: string;
  clinicId: string;
  organizationId: string;
  supplierId: string;

  invoiceNumber: string | null;
  invoiceDate: Date;
  lineAccountCode: string;

  /** Eşleştirildiği satın alma siparişi (opsiyonel — serbest fatura null kalır). */
  purchaseOrderId?: string | null;

  vatRate: number;

  netTotal: string | number | Decimal;
  vatTotal: string | number | Decimal;
  grandTotal: string | number | Decimal;

  currency: CurrencyType;
}
