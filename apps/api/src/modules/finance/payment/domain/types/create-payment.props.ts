import { PaymentMethod, Prisma } from '@prisma/client';

export interface CreateInstallmentProps {
  id: string;
  installmentNo: number;
  amount: Prisma.Decimal;
  currency: string;
  method?: PaymentMethod;
  dueDate?: Date | null;
  note?: string | null;
}

export interface CreatePaymentProps {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string | null;
  providerId?: string | null;
  totalAmount: Prisma.Decimal;
  currency: string;
  installments: CreateInstallmentProps[];
}
