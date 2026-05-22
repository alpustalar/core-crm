import { IyzicoTransaction, PaymentInstallment, Payment } from '@prisma/client';

export const IYZICO_TRANSACTION_REPOSITORY = Symbol('IIyzicoTransactionRepository');

export interface CreateIyzicoTransactionInput {
  installmentId: string;
  conversationId: string;
  token?: string;
}

export interface MarkPaidInput {
  iyzicoTransactionId: string;
  iyzicoPaymentId: string;
  iyzicoPaymentTransactionId?: string;
  rawResponse?: unknown;
}

export interface MarkRefundedInput {
  iyzicoTransactionId: string;
  rawResponse?: unknown;
}

export interface MarkFailedInput {
  iyzicoTransactionId: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

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
  createTransaction(input: CreateIyzicoTransactionInput): Promise<IyzicoTransaction>;
  markAsSuccess(input: MarkPaidInput): Promise<IyzicoTransaction>;
  markAsFailed(input: MarkFailedInput): Promise<IyzicoTransaction>;
  markAsRefunded(input: MarkRefundedInput): Promise<IyzicoTransaction>;
}
