import { IyzicoSdkStatus } from '@src/infrastructure/payment/pos/virtual/providers/iyzico';
import { PaymentProviderFailedException } from '@modules/finance/payment/domain/exceptions/payment.exceptions';

export interface IyzicoSdkResult {
  status?: string;
  errorMessage?: string;
}

/**
 * iyzico SDK'sından dönen ham sonucun başarı barikatını denetleyen değer nesnesi.
 * Eski `PaymentDomainService.check.iyzicoSdkStatus` metodunun VO karşılığıdır: sağlayıcı
 * "success" dönmediyse `PaymentProviderFailedException` fırlatır.
 *
 * Örn: `IyzicoResultGuard.of(sdkResult).assertSuccess().orThrow()`
 */
export class IyzicoResultGuard {
  private constructor(private readonly result: IyzicoSdkResult) {}

  static of(result: IyzicoSdkResult): IyzicoResultGuard {
    return new IyzicoResultGuard(result);
  }

  public assertSuccess() {
    const isValid =
      this.result.status?.toLowerCase() ===
      IyzicoSdkStatus.SUCCESS.toLowerCase();

    return {
      isValid,
      isInvalid: !isValid,
      orThrow: () => {
        if (!isValid) {
          throw new PaymentProviderFailedException(this.result.errorMessage);
        }
      },
    };
  }
}
