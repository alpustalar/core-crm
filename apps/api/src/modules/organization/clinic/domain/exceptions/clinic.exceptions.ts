import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { HttpStatus } from '@nestjs/common';

export class ClinicNotFoundException extends DomainException {
  public errorCode = ERROR_CODES.CLINIC.NOT_FOUND;
  public override httpStatus = HttpStatus.NOT_FOUND;
  constructor() {
    super('Klinik bulunamadı');
  }
}
