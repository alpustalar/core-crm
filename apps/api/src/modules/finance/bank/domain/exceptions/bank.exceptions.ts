import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

export class BankAccountNotFoundException extends DomainException<{
  bankAccountId?: string;
}> {
  readonly errorCode = ERROR_CODES.BANK_ACCOUNT.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(bankAccountId?: string) {
    super('Banka hesabı bulunamadı.', { bankAccountId });
  }
}

export class BankAccountArchivedException extends DomainException<{
  bankAccountId?: string;
}> {
  readonly errorCode = ERROR_CODES.BANK_ACCOUNT.ARCHIVED;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(bankAccountId?: string) {
    super('Arşivlenmiş bir banka hesabında bu işlem yapılamaz.', {
      bankAccountId,
    });
  }
}

export class BankStatementNotFoundException extends DomainException<{
  bankStatementId?: string;
}> {
  readonly errorCode = ERROR_CODES.BANK_STATEMENT.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(bankStatementId?: string) {
    super('Banka ekstresi bulunamadı.', { bankStatementId });
  }
}

export class BankStatementEmptyLinesException extends DomainException {
  readonly errorCode = ERROR_CODES.BANK_STATEMENT.EMPTY_LINES;

  constructor(message = 'Ekstre en az bir hareket satırı içermelidir.') {
    super(message);
  }
}

export class BankStatementLineNotFoundException extends DomainException<{
  lineId?: string;
}> {
  readonly errorCode = ERROR_CODES.BANK_STATEMENT.LINE_NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(lineId?: string) {
    super('Ekstre satırı bulunamadı.', { lineId });
  }
}
