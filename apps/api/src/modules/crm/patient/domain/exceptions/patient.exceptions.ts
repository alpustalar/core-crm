import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { HttpStatus } from '@nestjs/common';

export class InvalidPatientProfileException extends DomainException {
  readonly errorCode = ERROR_CODES.PATIENT.INVALID_PROFILE_DATA;

  constructor() {
    super('Misafir adı ve telefon numarası boş bırakılamaz.');
  }
}

export class PatientNotFoundException extends DomainException {
  readonly errorCode = ERROR_CODES.PATIENT.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor() {
    super('Misafir bulunamadı.');
  }
}

export class PatientPhoneRequiredException extends DomainException {
  readonly errorCode = ERROR_CODES.PATIENT.PHONE_REQUIRED;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor() {
    super('Hasta telefon numarası zorunludur.');
  }
}

export class PatientNotRegisteredException extends DomainException {
  readonly errorCode = ERROR_CODES.PATIENT.NOT_REGISTERED;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor() {
    super('Hasta telefon numarası veya Firebase kimliği eksik.');
  }
}

/**
 * Aktör bu hasta kapsamına erişemiyor (farklı organizasyon ya da yönetmediği
 * klinik). 403: kaydın var olup olmadığını sızdırmadan reddeder.
 */
export class PatientAccessDeniedException extends DomainException {
  readonly errorCode = ERROR_CODES.PATIENT.ACCESS_DENIED;
  public override readonly httpStatus = HttpStatus.FORBIDDEN;

  constructor(message = 'Bu hasta kayıtlarına erişim yetkiniz yok.') {
    super(message);
  }
}
