import { Injectable, Logger } from '@nestjs/common';
import {
  PaymentNotCancellableException,
  PaymentNotRefundableException,
  PaymentProviderFailedException,
} from '@modules/finance/payment/domain/exceptions/payment.exceptions';
import { IyzicoSdkStatus } from '@src/infrastructure/payment/pos/virtual/providers/iyzico';
import PaymentStatusSchema, {
  PaymentStatusType,
} from '@input-type-schemas/PaymentStatusSchema';
import {
  IyzicoTransactionStatusSchema,
  IyzicoTransactionStatusType,
} from '@input-type-schemas/IyzicoTransactionStatusSchema';

interface CheckIyzicoSdkStatusProps {
  status: string;
  sdkErrorMessage?: string;
  paymentId: string;
  conversationId: string;
}

// TSC derleyicisinin autocomplete'i beslemesi için zırhlanmış interface'ler
interface IPaymentDomainServiceValidate {
  refundEligibility: (payment: { id: string; status: PaymentStatusType }) => {
    isValid: boolean;
    isInvalid: boolean;
    orThrow: () => void;
  };
  isComplete: (payment: { id: string; status: PaymentStatusType }) => {
    isValid: boolean;
    isInvalid: boolean;
    orThrow: () => void;
  };
}

interface IPaymentDomainServiceCheck {
  iyzicoSdkStatus: (props: CheckIyzicoSdkStatusProps) => {
    isValid: boolean;
    isInvalid: boolean;
    orThrow: () => void;
  };
}

@Injectable()
export class PaymentDomainService {
  readonly logger = new Logger(PaymentDomainService.name);

  /**
   * 🎯 1. Validate (Getter): Domain kurallarının uygunluk validasyonlarını toplar
   * Örn: service.validate.isComplete(payment).orThrow()
   */
  public get validate(): IPaymentDomainServiceValidate {
    const self = this;

    return {
      refundEligibility: (payment) => {
        const isValid = payment.status === PaymentStatusSchema.enum.COMPLETED;
        return {
          isValid,
          isInvalid: !isValid,
          orThrow: () => {
            if (!isValid) {
              self.logger.warn(
                `İade reddedildi: Ödeme tamamlanmış durumda değil.`,
                {
                  paymentId: payment.id,
                  status: payment.status,
                }
              );
              throw new PaymentNotRefundableException(payment.status);
            }
          },
        };
      },
      isComplete: (payment) => {
        // Eski paymentIsCompleteOrThrow metodunun tam karşılığı
        const isValid = payment.status === PaymentStatusSchema.enum.COMPLETED;
        return {
          isValid,
          isInvalid: !isValid,
          orThrow: () => {
            if (!isValid) {
              throw new PaymentNotCancellableException(payment.status);
            }
          },
        };
      },
    };
  }

  /**
   * 🎯 2. Check (Getter): Dış sağlayıcılardan (Iyzico vb.) gelen durumları/barikatları kontrol eder
   * Örn: service.check.iyzicoSdkStatus(props).orThrow()
   */
  public get check(): IPaymentDomainServiceCheck {
    const self = this;

    return {
      iyzicoSdkStatus: (props) => {
        const { status, sdkErrorMessage, paymentId, conversationId } = props;
        const isValid =
          status?.toLowerCase() === IyzicoSdkStatus.SUCCESS.toLowerCase();

        return {
          isValid,
          isInvalid: !isValid,
          orThrow: () => {
            if (!isValid) {
              self.logger.warn(
                `İyzico işlemi başarısız: - ${sdkErrorMessage}`,
                {
                  paymentId,
                  conversationId,
                }
              );
              throw new PaymentProviderFailedException(sdkErrorMessage);
            }
          },
        };
      },
    };
  }

  /**
   * Idempotency Kontrolü: Akışı bozmayan, boolean dönen bir metot olduğu için normal yapısında bıraktık.
   */
  public isAlreadyProcessed(
    iyzicoTx: { status: IyzicoTransactionStatusType },
    conversationId: string
  ): boolean {
    if (iyzicoTx.status === IyzicoTransactionStatusSchema.enum.SUCCESS) {
      this.logger.warn(`Ödeme zaten önceden işlenmiş (Idempotency).`, {
        conversationId,
      });
      return true;
    }
    return false;
  }
}
