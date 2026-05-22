import { Payment, PaymentInstallment, PaymentMethod } from '@prisma/client';

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

export type PaymentWithInstallments = Payment & { installments: PaymentInstallment[] };

export interface IPaymentRepository {
  createSinglePayment(input: CreateSinglePaymentInput): Promise<PaymentWithInstallments>;
  createInstallmentPlan(input: CreateInstallmentPlanInput): Promise<PaymentWithInstallments>;
  findByAppointmentId(appointmentId: string): Promise<Payment | null>;
  findPaymentWithInstallments(paymentId: string): Promise<PaymentWithInstallments | null>;
  markInstallmentAsPaid(installmentId: string): Promise<PaymentInstallment>;
  markInstallmentAsFailed(installmentId: string): Promise<PaymentInstallment>;
  markInstallmentAsRefunded(installmentId: string): Promise<PaymentInstallment>;
  markInstallmentAsCancelled(installmentId: string): Promise<PaymentInstallment>;
}
