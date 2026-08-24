import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { PaymentMethodType } from '@input-type-schemas/PaymentMethodSchema';
import { Money } from '@src/domain/value-objects/money.vo';
import { LogSource } from '@src/domain/constants/log-action.constant';

/**
 * Payment domain kontratları — entity static `create()` girişi (Props) ve durum
 * geçişi metod girdileri.
 */

// ==========================================
// TAKSİTLENDİRME VE PLANLAMA
// ==========================================

/**
 * Ödeme planı kırılımı — kullanıcının serbestçe girdiği taksit satırı.
 * (create-payment-plan komutu tarafından tüketilir.)
 */
export interface InstallmentPlanItem {
  amount: number;
  method: string;
  dueDate?: Date;
  note?: string;
}

export interface CreateInstallmentPlanData {
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  providerId?: string;
  currency: CurrencyType;
  installments: InstallmentPlanItem[];
}

/** Entity `create()`e beslenen tek taksit girişi. `installmentNo` handler'da üretilir (her zaman pozitif, sıralı). */
export interface CreateInstallmentProps {
  id: string;
  installmentNo: number;
  /** Taksit tutarı — Money VO (negatiflik/sonluluk VO'da korunur). */
  money: Money;
  method?: PaymentMethodType;
  dueDate?: Date | null;
  note?: string | null;
}

/**
 * Taksit iadesi. Event entity içinde raise edildiği için (bkz. CLAUDE.md) audit
 * alanları buradan taşınır; `details` verilmezse varsayılan metin yazılır.
 */
export interface RefundInstallmentProps {
  installmentId: string;
  actorId: string;
  logSource: LogSource;
  details?: string;
}

// ==========================================
// ÖDEME VE TAHSİLAT
// ==========================================

export interface CreatePaymentProps {
  id?: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string | null;
  providerId?: string | null;
  /** Toplam tutar — Money VO; taksitlerin toplamıyla eşleşmesi entity'de doğrulanır. */
  totalAmount: Money;
  /** En az bir taksit kırılımı veya peşinat olmalıdır — entity `create()` bunu doğrular. */
  installments: CreateInstallmentProps[];
}

export interface CreateSinglePaymentData {
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  providerId?: string;
  amount: number;
  currency: CurrencyType;
  method?: PaymentMethodType;
  dueDate?: Date;
}
