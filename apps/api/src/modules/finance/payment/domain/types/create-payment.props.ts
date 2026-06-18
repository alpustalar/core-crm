import { PaymentMethodType } from '@input-type-schemas/PaymentMethodSchema';
import { Money } from '@src/domain/value-objects/money.vo';

export interface CreateInstallmentProps {
  id: string;
  installmentNo: number;
  money: Money;
  method?: PaymentMethodType;
  dueDate?: Date | null;
  note?: string | null;
}

export interface CreatePaymentProps {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string | null;
  providerId?: string | null;
  totalAmount: Money;
  installments: CreateInstallmentProps[];
}
