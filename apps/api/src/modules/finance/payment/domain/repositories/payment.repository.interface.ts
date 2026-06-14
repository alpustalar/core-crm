import { PaymentMethod } from '@prisma/client';
import { Payment } from '@modules/finance/payment/domain/entities/payment.entity';
import {
  ArAgingData,
  ArAgingFilter,
} from '@modules/finance/payment/domain/types/ar-aging.type';
import {
  CollectedInstallmentRow,
  ProviderRevenueFilter,
} from '@modules/finance/payment/domain/types/provider-revenue.type';

export const PAYMENT_REPOSITORY = Symbol('IPaymentRepository');

export interface CreateSinglePaymentInput {
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  providerId?: string;
  amount: number;
  currency: string;
  method?: PaymentMethod;
  dueDate?: Date;
}

export interface InstallmentPlanItem {
  amount: number;
  method: PaymentMethod;
  dueDate?: Date;
  note?: string;
}

export interface CreateInstallmentPlanInput {
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  providerId?: string;
  currency: string;
  installments: InstallmentPlanItem[];
}

export interface IPaymentRepository {
  createSinglePayment(input: CreateSinglePaymentInput): Promise<Payment>;
  createInstallmentPlan(input: CreateInstallmentPlanInput): Promise<Payment>;
  findByAppointmentId(appointmentId: string): Promise<Payment | null>;
  findPaymentWithInstallments(paymentId: string): Promise<Payment | null>;
  findByInstallmentId(installmentId: string): Promise<Payment | null>;
  save(entity: Payment): Promise<Payment>;
  saveMany(entities: Payment[]): Promise<void>;

  /** AR aging: şubenin açık taksitleri + tahsil edilmiş toplamı (yönetim raporu). */
  arAging(filter: ArAgingFilter): Promise<ArAgingData>;

  /** Hekim cirosu: tahsil edilmiş taksitlerin hekim boyutu (yönetim raporu). */
  providerRevenue(
    filter: ProviderRevenueFilter
  ): Promise<CollectedInstallmentRow[]>;
}
