import type { Payment, PaymentInstallment } from '@shared/generated-zod';
import { z } from 'zod';
import PaymentInstallmentSchema from '@shared/generated-zod/modelSchema/PaymentInstallmentSchema';
import PaymentSchema from '@shared/generated-zod/modelSchema/PaymentSchema';

export const PaymentWithInstallmentsSchema = PaymentSchema.extend({
  installments: z.array(PaymentInstallmentSchema),
});
export type PaymentWithInstallment = z.infer<typeof PaymentWithInstallmentsSchema>;

type PaymentProps = Payment & {
  installments: PaymentInstallment[] | null;
};

export function paymentHasInstallments(
  payment: PaymentProps
): payment is PaymentWithInstallment {

  if (!payment || !payment.installments) {
    return false;
  }

  const inst = payment.installments;

  if (Array.isArray(inst) && inst.length > 0) {
    const firstInstallment = inst[0];
    return Boolean(firstInstallment && firstInstallment.id);
  }

  return false

}