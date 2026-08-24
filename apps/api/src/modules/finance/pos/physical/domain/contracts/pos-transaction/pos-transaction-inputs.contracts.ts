import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { PosTransactionKindType } from '@input-type-schemas/PosTransactionKindSchema';

/**
 * PosTransaction domain kontratları — entity static `create()` girişi (Props).
 */
export interface CreatePosTransactionProps {
  // Kimlik bilgileri
  id?: string;
  posDeviceId: string;

  // Kurumsal bağlam
  clinicId: string;
  patientId?: string | null;
  appointmentId?: string | null;
  /** Eğer varsa ilgili ödeme kaydı. */
  paymentId?: string | null;

  // Finansal veriler
  amount: number;
  currency: CurrencyType;

  // Ters kayıt bilgisi — SALE dışındaki türler orijinal satışa bağlanmak zorundadır
  /** Verilmezse SALE. */
  kind?: PosTransactionKindType;
  originalPosTransactionId?: string;

  // Teknik veriler
  /** Banka veya ödeme kuruluşunun verdiği referans. */
  externalRef?: string | null;

  /** Ham veri (JSON blob) — ileriye dönük debug ve denetim için. */
  rawRequest?: unknown;
}
