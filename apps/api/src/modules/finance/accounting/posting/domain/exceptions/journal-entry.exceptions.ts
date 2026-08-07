import { DomainException } from '@src/domain/exceptions';
import { HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '@common/constants/error-codes.constant';

export class JournalEntryUniqueConstraintException extends DomainException {
  public errorCode = ERROR_CODES.JOURNAL_ENTRY.UNIQUE_CONSTRAINT_VIOLATION;
  public override httpStatus = HttpStatus.CONFLICT;
  constructor() {
    super('Bu finansal olay için yevmiye fişi zaten mevcut.');
  }
}
