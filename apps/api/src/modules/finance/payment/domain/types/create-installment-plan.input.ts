import { InstallmentPlanItem } from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface CreateInstallmentPlanInput {
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  providerId?: string;
  currency: CurrencyType;
  installments: InstallmentPlanItem[];
}
