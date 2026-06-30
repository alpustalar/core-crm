import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';

export class AccountNotFoundInChartException extends DomainException<{
  code: string;
}> {
  readonly errorCode = ERROR_CODES.ACCOUNTING.ACCOUNT_NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;
  constructor(code: string) {
    super(`Hesap planında kod bulunamadı: ${code}`, { code });
  }
}

export class AccountTemplateMismatchException extends DomainException<{
  code: string;
  parentCode: string;
}> {
  readonly errorCode = ERROR_CODES.ACCOUNTING.TEMPLATE_MISMATCH;
  constructor(code?: string, parentCode?: string) {
    super(`Alt hesabın tipi/yönü, üst hesap ile uyuşmuyor.`, {
      code,
      parentCode,
    });
  }
}

export class CannotCreateChildException extends DomainException<{
  code: string;
}> {
  readonly errorCode = ERROR_CODES.ACCOUNTING.CANNOT_CREATE_CHILD;
  constructor(code?: string) {
    super(
      `Doğrudan kayıt alan hesabın altına alt hesap açılamaz. Önce bu hesabın postable özelliğini kapatmalısınız.`,
      { code }
    );
  }
}

export class InvalidAccountNameException extends DomainException<{
  name: string;
}> {
  readonly errorCode = ERROR_CODES.ACCOUNTING.INVALID_NAME;
  constructor(name?: string) {
    super(`Hesap adı geçersiz. 2-200 karakter arasında olmalıdır.`, { name });
  }
}
