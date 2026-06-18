import { PaymentMethodType as PaymentMethod } from '@input-type-schemas/PaymentMethodSchema';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface CreateSinglePaymentData {
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  providerId?: string;
  amount: number;
  currency: CurrencyType;
  method?: PaymentMethod;
  dueDate?: Date;
}
