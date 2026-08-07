import { Invoice as IInvoice } from '@shared';
import { Invoice } from '@modules/finance/invoice/domain/entities/invoice.entity';
import {
  CreateInvoiceProps,
  FindInvoicesFilter,
} from '@modules/finance/invoice/domain/invoice.contracts';
import { Pagination } from '@shared';

export const INVOICE_COMMAND_REPOSITORY = Symbol('IInvoiceCommandRepository');
export const INVOICE_QUERY_REPOSITORY = Symbol('IInvoiceQueryRepository');

export interface IInvoiceCommandRepository {
  create(props: CreateInvoiceProps): Promise<Invoice>;
  update(entity: Invoice): Promise<Invoice>;

  /** e-Belge sonucu işlenecek fatura (mutasyon okuması). */
  findById(id: string): Promise<Invoice | null>;

  /**
   * Aynı randevu/ödeme için fatura zaten kesilmiş mi? Yeni fatura üretilip
   * üretilmeyeceğini belirlediği için Command Context'te okunur.
   */
  findByAppointmentId(appointmentId: string): Promise<Invoice | null>;
  findByPaymentId(paymentId: string): Promise<Invoice | null>;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IInvoiceQueryRepository {
  findById(id: string): Promise<IInvoice | null>;
  findByPaymentId(paymentId: string): Promise<IInvoice | null>;
  findMany(
    filter: FindInvoicesFilter,
    pagination: Pagination
  ): Promise<{ items: IInvoice[]; total: number }>;
}
