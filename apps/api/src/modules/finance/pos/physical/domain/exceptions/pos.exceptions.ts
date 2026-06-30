import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';

export class PosDeviceNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.DEVICE_NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(message = 'POS cihazı bulunamadı veya aktif değil.') {
    super(message);
  }
}

export class PosTransactionNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.TRANSACTION_NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(externalRef: string) {
    super(`POS işlemi bulunamadı: externalRef=${externalRef}`);
  }
}

export class OriginalPosTransactionNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.ORIGINAL_TRANSACTION_NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(message = 'Orijinal POS işlemi bulunamadı.') {
    super(message);
  }
}

export class PosTransactionNotRefundableException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.NOT_REFUNDABLE;

  constructor(message = 'Yalnızca başarılı işlemler iade edilebilir.') {
    super(message);
  }
}

export class PosTransactionNotVoidableException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.NOT_VOIDABLE;

  constructor(message = 'Yalnızca başarılı işlemler iptal edilebilir.') {
    super(message);
  }
}

export class PosTransactionMissingExternalRefException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.MISSING_EXTERNAL_REF;

  constructor(
    message = 'Orijinal işlemin PAX referansı (HostRefNum) bulunamadı.'
  ) {
    super(message);
  }
}

export class RefundAmountExceedsOriginalException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.REFUND_AMOUNT_EXCEEDS_ORIGINAL;

  constructor(message = 'İade tutarı orijinal işlem tutarını aşamaz.') {
    super(message);
  }
}

export class PosDeviceProviderMismatchException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.PROVIDER_MISMATCH;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(expected: string, actual: string, detail?: string) {
    super(
      detail ??
        `POS işlemi ${expected} sağlayıcısı bekliyor; cihaz ${actual} olarak yapılandırılmış.`
    );
  }
}

export class PosDeviceMissingDeviceUniqueIdException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.MISSING_DEVICE_UNIQUE_ID;

  constructor(
    message = 'iyzico Terminal cihazı için deviceUniqueId tanımlı değil.'
  ) {
    super(message);
  }
}

export class ClinicIyzicoTerminalConfigNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.IYZICO_TERMINAL_CONFIG_NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(
    message = 'Kliniğe ait iyzico Terminal kimlik bilgileri bulunamadı.'
  ) {
    super(message);
  }
}

export class PosTransactionMissingPaymentDateException extends DomainException {
  public readonly errorCode = ERROR_CODES.POS.MISSING_PAYMENT_DATE;

  constructor(
    message = 'Orijinal işlemin iyzico ödeme tarihi (paymentDate) bulunamadı.'
  ) {
    super(message);
  }
}
