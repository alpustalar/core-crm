import { IyzicoSdkStatus } from '@src/infrastructure/payment/pos/virtual/providers/iyzico';
import { PaymentProviderFailedException } from '@modules/finance/payment/domain/exceptions/payment.exceptions';

export interface IyzicoSdkResult {
  status?: string;
  errorMessage?: string;
}

/**
 * iyzico SDK'sından dönen ham sonucun başarı barikatını denetleyen değer nesnesi.
 * "success" dönmediyse `PaymentProviderFailedException` fırlatır.
 *
 * @example
 * IyzicoResultGuard.create(sdkResult).isSuccess().orThrow();
 * // veya özel hata ile:
 * IyzicoResultGuard.create(sdkResult).isSuccess().orThrow(new CustomException());
 */
export class IyzicoResultGuard {
  private constructor(private readonly result: IyzicoSdkResult) {}

  static create(result: IyzicoSdkResult): IyzicoResultGuard {
    return new IyzicoResultGuard(result);
  }

  public isSuccess() {
    const isValid =
      this.result.status?.toLowerCase() ===
      IyzicoSdkStatus.SUCCESS.toLowerCase();

    return {
      isValid,
      orThrow: (customError?: Error) => {
        if (!isValid) {
          throw (
            customError ??
            new PaymentProviderFailedException(this.result.errorMessage)
          );
        }
      },
    };
  }
}
