import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { HttpStatus } from '@nestjs/common';

export class ProductNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.INVENTORY.PRODUCT_NOT_FOUND;
  override httpStatus: HttpStatus.NOT_FOUND;
  constructor(message = 'Ürün bulunamadı') {
    super(message);
  }
}

export class SupplierNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.INVENTORY.SUPPLIER_NOT_FOUND;
  override httpStatus: HttpStatus.NOT_FOUND;
  constructor(id?: string) {
    super('Tedarikçi bulunamadı', { id });
  }
}
