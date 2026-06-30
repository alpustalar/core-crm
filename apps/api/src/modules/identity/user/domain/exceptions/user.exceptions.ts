import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidUserUpdateException extends DomainException<{
  userId?: string;
}> {
  readonly errorCode = ERROR_CODES.USER.INVALID_UPDATE;
  constructor(userId?: string) {
    super('Silinmiş bir kullanıcı güncellenemez.', { userId });
  }
}

export class InvalidUserDeletionException extends DomainException<{
  userId?: string;
}> {
  readonly errorCode = ERROR_CODES.USER.INVALID_DELETION;
  constructor() {
    super('Sistem yöneticisi hesabı silinemez.');
  }
}

export class UserNotFoundException extends DomainException {
  readonly errorCode = ERROR_CODES.USER.NOT_FOUND;
  public override httpStatus: HttpStatus.NOT_FOUND;
  constructor(msg = 'Kullanıcı bulunamadı') {
    super(msg);
  }
}
