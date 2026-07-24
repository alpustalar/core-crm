import {
  IyzicoTransaction as IyzicoTransactionModel,
  Payment,
  PaymentInstallment,
} from '@shared';
import { IyzicoTransaction } from '@modules/finance/pos/virtual/domain/entities/iyzico-transaction.entity';

export const IYZICO_TRANSACTION_COMMAND_REPOSITORY = Symbol(
  'IIyzicoTransactionCommandRepository'
);

export const IYZICO_TRANSACTION_QUERY_REPOSITORY = Symbol(
  'IIyzicoTransactionQueryRepository'
);

/** Read-model: işlem + taksit + ödeme (callback akışında payment/muhasebe için). */
export type IyzicoTransactionWithInstallment = IyzicoTransactionModel & {
  installment: PaymentInstallment & {
    payment: Payment;
  };
};

export interface IIyzicoTransactionQueryRepository {
  findTransactionByConversationId(
    conversationId: string
  ): Promise<IyzicoTransactionWithInstallment | null>;
  findByInstallmentId(installmentId: string): Promise<IyzicoTransaction | null>;
}

export interface IIyzicoTransactionCommandRepository {
  /** Yeni işlem kaydı (INSERT). */
  create(entity: IyzicoTransaction): Promise<IyzicoTransaction>;
  /** Mevcut işlemi günceller (UPDATE). Durum geçişleri entity metodlarında yapılır. */
  save(entity: IyzicoTransaction): Promise<IyzicoTransaction>;
}
