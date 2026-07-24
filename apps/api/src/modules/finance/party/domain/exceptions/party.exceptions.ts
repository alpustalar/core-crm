import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { HttpStatus } from '@nestjs/common';

export class PartyAlreadyExistsError extends Error {
  constructor() {
    super('Bu kaynak için cari zaten mevcut.');
    this.name = 'PartyAlreadyExistsError';
  }
}
export class StaffNotFoundException extends DomainException {
  readonly errorCode = ERROR_CODES.PARTY.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;
  constructor() {
    super('Personel bulunamadı');
  }
}
