import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';

export class PurchaseInvoiceNotFoundException extends DomainException<{
  invoiceId?: string;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_INVOICE.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(invoiceId?: string) {
    super('Alış faturası bulunamadı.', { invoiceId });
  }
}

export class PurchaseInvoiceAlreadyMatchedException extends DomainException<{
  invoiceId: string;
  purchaseOrderId: string;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_INVOICE.ALREADY_MATCHED;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(meta: { invoiceId: string; purchaseOrderId: string }) {
    super(
      'Fatura zaten bir siparişe eşleştirilmiş. Önce mevcut eşleştirmeyi kaldırın.',
      meta
    );
  }
}

export class PurchaseInvoiceNotMatchedException extends DomainException<{
  invoiceId?: string;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_INVOICE.NOT_MATCHED;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(invoiceId?: string) {
    super('Fatura herhangi bir siparişe eşleştirilmemiş.', { invoiceId });
  }
}

export class PurchaseInvoiceNotMatchableException extends DomainException<{
  currentStatus?: string;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_INVOICE.NOT_MATCHABLE;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(currentStatus?: string) {
    super('İptal edilmiş fatura siparişe eşleştirilemez.', { currentStatus });
  }
}
