import { Decimal } from 'decimal.js';
import { PurchaseOrderBillingStatusType } from '@input-type-schemas/PurchaseOrderBillingStatusSchema';

/**
 * Fatura eşleştirme hesapları — saf fonksiyonlar. Hem entity (yazma tarafı) hem
 * sorgu handler'ı (okuma tarafı) buradan besleniyor: aynı sayıyı iki yerde
 * hesaplamak, ekranda görünen "kalan" ile yazmada uygulanan sınırın sessizce
 * ayrışmasına yol açardı.
 *
 * Girdi tipi gevşek (`toString()` yeten her şey): entity `decimal.js`, okuma
 * modeli Prisma Decimal taşır; ikisini de aynı fonksiyon yutar.
 */
export interface NumericLike {
  toString(): string;
}

export interface BillableLineSnapshot {
  quantityReceived: NumericLike;
  unitPrice: NumericLike;
  vatRate: number;
}

export interface PurchaseOrderMatchSummary {
  /** Sipariş tutarı (KDV dahil). */
  orderedTotal: number;
  /** Teslim alınan malın KDV dahil değeri. */
  receivedValue: number;
  /** Eşleştirilmiş faturaların KDV dahil toplamı. */
  invoicedTotal: number;
  /** Sipariş tutarından faturalanmamış kısım. */
  remainingToInvoice: number;
  /**
   * Teslim ile fatura arasındaki sapma (teslim − fatura). Pozitif: mal geldi
   * faturası gelmedi. Negatif: faturalandı ama mal (henüz) gelmedi.
   */
  receiptVariance: number;
  billingStatus: PurchaseOrderBillingStatusType;
}

const toDecimal = (value: NumericLike): Decimal =>
  new Decimal(value.toString());

/** Teslim alınan miktarların KDV dahil değeri. */
export function calculateReceivedValue(lines: BillableLineSnapshot[]): Decimal {
  return lines
    .reduce((sum, line) => {
      const net = toDecimal(line.quantityReceived)
        .mul(toDecimal(line.unitPrice))
        .toDecimalPlaces(2);
      const vat = net.mul(line.vatRate).div(100).toDecimalPlaces(2);
      return sum.plus(net).plus(vat);
    }, new Decimal(0))
    .toDecimalPlaces(2);
}

export interface MatchSummaryInput {
  grandTotal: NumericLike;
  invoicedTotal: NumericLike;
  billingStatus: PurchaseOrderBillingStatusType;
  lines: BillableLineSnapshot[];
}

export function buildMatchSummary(
  input: MatchSummaryInput
): PurchaseOrderMatchSummary {
  const orderedTotal = toDecimal(input.grandTotal);
  const invoicedTotal = toDecimal(input.invoicedTotal);
  const receivedValue = calculateReceivedValue(input.lines);
  const remaining = orderedTotal.minus(invoicedTotal);

  return {
    orderedTotal: orderedTotal.toNumber(),
    receivedValue: receivedValue.toNumber(),
    invoicedTotal: invoicedTotal.toNumber(),
    remainingToInvoice: remaining.isNegative() ? 0 : remaining.toNumber(),
    receiptVariance: receivedValue.minus(invoicedTotal).toNumber(),
    billingStatus: input.billingStatus,
  };
}
