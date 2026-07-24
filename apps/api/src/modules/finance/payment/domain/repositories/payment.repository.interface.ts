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

export type IPaymentCommandRepository = IBaseCommandRepository<Payment> & {};

export interface IPaymentQueryRepository {
  findByAppointmentId(appointmentId: string): Promise<Payment | null>;
  findPaymentWithInstallments(paymentId: string): Promise<Payment | null>;
  findByInstallmentId(installmentId: string): Promise<Payment | null>;

  /** AR aging: şubenin açık taksitleri + tahsil edilmiş toplamı (yönetim raporu). */
  arAging(filter: ArAgingFilter): Promise<ArAgingData>;

  /** Hekim cirosu: tahsil edilmiş taksitlerin hekim boyutu (yönetim raporu). */
  providerRevenue(
    filter: ProviderRevenueFilterData
  ): Promise<CollectedInstallmentRow[]>;
}
