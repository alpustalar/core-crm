import { Payment as IPayment, PaymentInstallment } from '@shared';
import {
  ArAgingData,
  ArAgingFilter,
  CollectedInstallmentRow,
  ProviderRevenueFilterData,
} from '@modules/finance/payment/domain/contracts/payment.contracts';

export const PAYMENT_QUERY_REPOSITORY = Symbol('IPaymentQueryRepository');

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
