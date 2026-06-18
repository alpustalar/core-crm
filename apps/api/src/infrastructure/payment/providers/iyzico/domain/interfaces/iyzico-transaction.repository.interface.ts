import { IyzicoTransaction, Payment, PaymentInstallment } from '@shared';
import { CreateIyzicoTransactionInput } from '@src/infrastructure/payment/providers/iyzico/domain/types/create-iyzico-transaction.input';
import { MarkPaidInput } from '@src/infrastructure/payment/providers/iyzico/domain/types/mark-paid.input';
import { MarkFailedInput } from '@src/infrastructure/payment/providers/iyzico/domain/types/mark-failed.input';
import { MarkRefundedInput } from '@src/infrastructure/payment/providers/iyzico/domain/types/mark-refunded.input';

export const IYZICO_TRANSACTION_REPOSITORY = Symbol(
  'IIyzicoTransactionRepository'
);

export type IyzicoTransactionWithInstallment = IyzicoTransaction & {
  installment: PaymentInstallment & {
    payment: Payment;
  };
};

export interface IIyzicoTransactionRepository {
  findTransactionByConversationId(
    conversationId: string
  ): Promise<IyzicoTransactionWithInstallment | null>;
  findByInstallmentId(installmentId: string): Promise<IyzicoTransaction | null>;
  createTransaction(
    input: CreateIyzicoTransactionInput
  ): Promise<IyzicoTransaction>;
  markAsSuccess(input: MarkPaidInput): Promise<IyzicoTransaction>;
  markAsFailed(input: MarkFailedInput): Promise<IyzicoTransaction>;
  markAsRefunded(input: MarkRefundedInput): Promise<IyzicoTransaction>;
}
