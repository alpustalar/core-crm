import { Decimal } from 'decimal.js';

/**
 * PosTransaction domain kontratları — Command Repository'den beslenen okuma
 * modelleri (mutabakat taraması, iptal/iade özeti). Bu aggregate'in Query
 * repository'si YOK — bilinçli: POS işlem kaydı yalnız ödeme akışının içinden
 * (Command Context) okunur.
 */

/** PAX cihazına TCP bağlanmak için mutabakat taraması sırasında taşınan bağlantı anlık görüntüsü. */
export interface PendingTransactionDeviceSnapshot {
  host: string;
  port: number;
  terminalId: string;
  merchantId: string;
}

/** Grace period dışında kalan PENDING işlem — mutabakat taraması read-model'i. */
export interface PendingTransactionForReconcile {
  id: string;
  posDeviceId: string;
  clinicId: string;
  amount: Decimal;
  currency: string;
  initiatedAt: Date;
  device: PendingTransactionDeviceSnapshot;
}

/**
 * Bir satışın CANLI (PENDING/SUCCESS) ters kayıtlarının özeti. İptal/iade kararını
 * besler: iptal en fazla bir kez yapılabilir, iadeler kümülatif olarak satışı aşamaz.
 * Command Context'e aittir — orijinal satır `FOR UPDATE` kilitliyken okunur.
 */
export interface PosTransactionReversalSummary {
  hasActiveVoid: boolean;
  refundedAmount: Decimal;
}
