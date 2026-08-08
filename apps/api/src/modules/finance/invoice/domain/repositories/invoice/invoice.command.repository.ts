import { Invoice } from '@modules/finance/invoice/domain/entities/invoice.entity';
import { CreateInvoiceProps } from '@modules/finance/invoice/domain/contracts/invoice.contracts';

export const INVOICE_COMMAND_REPOSITORY = Symbol('IInvoiceCommandRepository');

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
