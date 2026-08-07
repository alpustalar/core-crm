import { Payment as IPayment, PaymentInstallment } from '@shared';
import { Payment } from '@modules/finance/payment/domain/entities/payment.entity';
import { PaymentMethod } from '@prisma/client';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import {
  ArAgingData,
  ArAgingFilter,
  CollectedInstallmentRow,
  ProviderRevenueFilterData,
} from '@modules/finance/payment/domain/contracts/payment.contracts';

export interface InstallmentPlanItem {
  amount: number;
  method: PaymentMethod;
  dueDate?: Date;
  note?: string;
}

export const PAYMENT_QUERY_REPOSITORY = Symbol('IPaymentQueryRepository');
export const PAYMENT_COMMAND_REPOSITORY = Symbol('IPaymentCommandRepository');

export interface IPaymentCommandRepository
  extends IBaseCommandRepository<Payment> {
  /**
   * Taksitin ait olduğu ödemeyi, satırı `FOR UPDATE` kilitleyerek yükler. Taksit
   * durum geçişleri (tahsil/iade/iptal/başarısız) para hareketidir ve POS callback'i
   * ile manuel işlem yarışabilir; kilit olmadan iki eşzamanlı geçiş birbirinin
   * üzerine yazar. Yalnız aktif transaction içinde çağrılır.
   */
  findByInstallmentIdForUpdate(installmentId: string): Promise<Payment | null>;
}

/** Okuma tarafı: entity değil, plain model / read-model döner. */
export interface IPaymentQueryRepository {
  findByAppointmentId(appointmentId: string): Promise<IPayment | null>;
  /** Ödeme + taksitleri (read-model) — taksit listesi doğrudan yanıta gider. */
  findPaymentWithInstallments(
    paymentId: string
  ): Promise<PaymentWithInstallments | null>;

  /** AR aging: şubenin açık taksitleri + tahsil edilmiş toplamı (yönetim raporu). */
  arAging(filter: ArAgingFilter): Promise<ArAgingData>;

  /** Hekim cirosu: tahsil edilmiş taksitlerin hekim boyutu (yönetim raporu). */
  providerRevenue(
    filter: ProviderRevenueFilterData
  ): Promise<CollectedInstallmentRow[]>;
}

/** Ödeme başlığı + taksit satırları (okuma modeli). */
export type PaymentWithInstallments = IPayment & {
  installments: PaymentInstallment[];
};
