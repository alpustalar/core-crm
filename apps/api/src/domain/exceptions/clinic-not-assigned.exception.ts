import { DomainException } from './domain.exception';
import { HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '@common/constants/error-codes.constant';

export class ClinicNotAssignedException extends DomainException {
  public readonly errorCode = ERROR_CODES.AUTH.CLINIC_NOT_ASSIGNED;

  public override readonly httpStatus = HttpStatus.BAD_REQUEST;

  constructor(
    message = 'İşlemi gerçekleştiren kullanıcı için bir klinik tanımlanmamış.'
  ) {
    super(message);
  }
}
