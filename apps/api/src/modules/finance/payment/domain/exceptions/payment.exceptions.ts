import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export class PaymentNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.PAYMENT.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(paymentId: string) {
    super(`Ödeme bulunamadı: paymentId=${paymentId}`);
  }
}

export class InstallmentNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.PAYMENT.INSTALLMENT_NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(installmentId: string) {
    super(`Taksit bulunamadı: ${installmentId}`);
  }
}

export class CompletedInstallmentNotFoundException extends DomainException {
  public readonly errorCode =
    ERROR_CODES.PAYMENT.COMPLETED_INSTALLMENT_NOT_FOUND;

  constructor(message = 'Tamamlanmış taksit bulunamadı.') {
    super(message);
  }
}

export class PaymentNotRefundableException extends DomainException<{
  status?: string;
}> {
  public readonly errorCode = ERROR_CODES.PAYMENT.NOT_REFUNDABLE;

  constructor(status?: string) {
    super(`İptal edilmiş veya bekleyen ödemeler iade edilemez.`, { status });
  }
}

export class PaymentNotCancellableException extends DomainException<{
  status: string;
}> {
  public readonly errorCode = ERROR_CODES.PAYMENT.NOT_CANCELLABLE;

  constructor(status?: string) {
    super(
      'Tamamlanmış veya iade süreci başlamış ödemeler iptal edilemez. İade metodunu kullanın.',
      { status }
    );
  }
}

export class InvalidInstallmentPlanException extends DomainException {
  public readonly errorCode = ERROR_CODES.PAYMENT.INVALID_INSTALLMENT_PLAN;

  constructor(
    message = 'Ödeme oluşturulabilmesi için en az bir taksit planı girilmelidir.'
  ) {
    super(message);
  }
}

export class InstallmentTotalMismatchException extends DomainException {
  public readonly errorCode = ERROR_CODES.PAYMENT.INSTALLMENT_TOTAL_MISMATCH;

  constructor(
    message: string,
    props: {
      totalInstallmentAmount: string;
      totalInstallmentCurrency: CurrencyType;
      propsTotalAmount: string;
      propsCurrency: CurrencyType;
    }
  ) {
    super(message, props);
  }
}

/**
 * Ödeme sağlayıcısı (iyzico SDK vb.) işlemi başarısız döndürdüğünde fırlatılır.
 * Payment domain'i provider'a özgü isimden habersiz kalsın diye jeneriktir.
 */
export class PaymentProviderFailedException extends DomainException<{
  sdkErrorMessage?: string;
}> {
  public readonly errorCode = ERROR_CODES.PAYMENT.PROVIDER_FAILED;

  constructor(sdkErrorMessage?: string) {
    super(`İşlem gerçekleştirilemedi: 'Bilinmeyen hata`, { sdkErrorMessage });
  }
}
