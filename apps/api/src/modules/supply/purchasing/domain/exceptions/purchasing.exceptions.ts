import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

export class PurchaseRequestNotFoundException extends DomainException<{
  requestId?: string;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_REQUEST.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(requestId?: string) {
    super('Satın alma talebi bulunamadı.', { requestId });
  }
}

export class PurchaseRequestNotPendingException extends DomainException<{
  currentStatus?: string;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_REQUEST.NOT_PENDING;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(currentStatus?: string) {
    super(
      'Yalnızca onay bekleyen (SUBMITTED) talepler bu işleme uygundur.',
      { currentStatus }
    );
  }
}

export class PurchaseRequestNotApprovedException extends DomainException<{
  currentStatus?: string;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_REQUEST.NOT_APPROVED;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(currentStatus?: string) {
    super(
      'Siparişe yalnızca onaylanmış (APPROVED) talep dönüştürülebilir.',
      { currentStatus }
    );
  }
}

export class PurchaseRequestEmptyItemsException extends DomainException {
  readonly errorCode = ERROR_CODES.PURCHASE_REQUEST.EMPTY_ITEMS;

  constructor(message = 'Satın alma talebi en az bir kalem içermelidir.') {
    super(message);
  }
}

export class PurchaseOrderNotFoundException extends DomainException<{
  orderId?: string;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_ORDER.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(orderId?: string) {
    super('Satın alma siparişi bulunamadı.', { orderId });
  }
}

export class PurchaseOrderEmptyItemsException extends DomainException {
  readonly errorCode = ERROR_CODES.PURCHASE_ORDER.EMPTY_ITEMS;

  constructor(message = 'Sipariş en az bir kalem içermelidir.') {
    super(message);
  }
}

export class PurchaseOrderInvalidStateException extends DomainException<{
  currentStatus?: string;
  operation?: string;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_ORDER.INVALID_STATE;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(message: string, currentStatus?: string, operation?: string) {
    super(message, { currentStatus, operation });
  }
}

export class PurchaseOrderItemNotFoundException extends DomainException<{
  itemId?: string;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_ORDER.ITEM_NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(itemId?: string) {
    super('Sipariş kalemi bulunamadı.', { itemId });
  }
}

export class PurchaseOrderOverReceiptException extends DomainException<{
  itemId: string;
  ordered: number;
  alreadyReceived: number;
  attempted: number;
}> {
  readonly errorCode = ERROR_CODES.PURCHASE_ORDER.OVER_RECEIPT;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(meta: {
    itemId: string;
    ordered: number;
    alreadyReceived: number;
    attempted: number;
  }) {
    super(
      'Teslim alınan miktar sipariş edilen miktarı aşamaz.',
      meta
    );
  }
}
