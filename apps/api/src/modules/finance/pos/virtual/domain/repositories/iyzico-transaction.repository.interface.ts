import {
  IyzicoTransaction as IyzicoTransactionModel,
  Payment,
  PaymentInstallment,
} from '@shared';
import { IyzicoTransaction } from '@modules/finance/pos/virtual/domain/entities/iyzico-transaction.entity';

export const IYZICO_TRANSACTION_COMMAND_REPOSITORY = Symbol(
  'IIyzicoTransactionCommandRepository'
);

/** Read-model: işlem + taksit + ödeme (callback akışında payment/muhasebe için). */
export type IyzicoTransactionWithInstallment = IyzicoTransactionModel & {
  installment: PaymentInstallment & {
    payment: Payment;
  };
};

/**
 * NOT: Bu aggregate'in Query repository'si YOK — bilinçli. iyzico işlem kaydı
 * yalnız ödeme akışının (callback / iade / iptal) içinden okunur; hepsi Command
 * Context'tir. Ayrı bir query repo'su tutmak, kilitsiz/replica okumayı yanlışlıkla
 * yazma yoluna sokmaktan başka bir işe yaramıyordu. Dışarıya okuma gerekirse
 * `payment` modülünün query'leri üzerinden verilir.
 */
export interface IIyzicoTransactionCommandRepository {
  /** Yeni işlem kaydı (INSERT). */
  create(entity: IyzicoTransaction): Promise<IyzicoTransaction>;
  /** Mevcut işlemi günceller (UPDATE). Durum geçişleri entity metodlarında yapılır. */
  update(entity: IyzicoTransaction): Promise<IyzicoTransaction>;
  /** Taksit id'siyle yükler — kilitsiz (yalnız dış referans okunacaksa). */
  findByInstallmentId(installmentId: string): Promise<IyzicoTransaction | null>;
  /**
   * Callback/webhook akışı için işlemi `FOR UPDATE` kilitleyip taksit + ödeme ile
   * birlikte döner — yalnız aktif transaction içinde.
   *
   * Kilit şart: iyzico hem tarayıcı callback'ini hem webhook'u gönderir. İkisi
   * eşzamanlı gelip aynı PENDING kaydı okursa "zaten işlenmiş mi" kontrolü iki kez
   * geçer → taksit iki kez COMPLETED olur, muhasebeye iki tahsilat yazılır.
   */
  findByConversationIdForUpdate(
    conversationId: string
  ): Promise<IyzicoTransactionWithInstallment | null>;
  /** Taksit id'siyle işlemi kilitleyerek yükler (iade/iptal) — yalnız transaction içinde. */
  findByInstallmentIdForUpdate(
    installmentId: string
  ): Promise<IyzicoTransaction | null>;
}
