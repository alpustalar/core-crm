import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IyzicoTransactionStatus, PaymentStatus } from '@prisma/client';
import { IyzicoSdkStatus } from '@src/infrastructure/payment/providers/iyzico';

interface checkIyzicoSdkStatusOrThrowProps {
  status: string;
  sdkErrorMessage?: string;
  paymentId: string;
  conversationId: string;
}
@Injectable()
export class PaymentDomainService {
  readonly logger = new Logger(PaymentDomainService.name);

  isAlreadyProcessed(
    iyzicoTx: { status: IyzicoTransactionStatus },
    conversationId: string
  ): boolean {
    if (iyzicoTx.status === IyzicoTransactionStatus.SUCCESS) {
      this.logger.warn(`Ödeme zaten önceden işlenmiş (Idempotency).`, {
        conversationId,
      });
      return true;
    }
    return false;
  }

  validateRefundEligibilityOrThrow(payment: {
    id: string;
    status: PaymentStatus;
  }) {
    if (payment.status !== PaymentStatus.COMPLETED) {
      this.logger.warn(`İade reddedildi: Ödeme tamamlanmış durumda değil.`, {
        paymentId: payment.id,
        status: payment.status,
      });

      throw new BadRequestException(
        `Yalnızca tamamlanmış ödemeler iade edilebilir. Mevcut durum: ${payment.status}`
      );
    }
  }

  checkIyzicoSdkStatusOrThrow(props: checkIyzicoSdkStatusOrThrowProps) {
    const { status, sdkErrorMessage, paymentId, conversationId } = props;

    if (status?.toLowerCase() !== IyzicoSdkStatus.SUCCESS.toLowerCase()) {
      this.logger.warn(`İyzico işlemi başarısız: - ${sdkErrorMessage}`, {
        paymentId,
        conversationId,
      });

      throw new BadRequestException(
        `İşlem gerçekleştirilemedi: 'Bilinmeyen hata - SDK Error - Message: ${sdkErrorMessage}'`
      );
    }
  }

  paymentIsCompleteOrThrow(payment: { id: string; status: PaymentStatus }) {
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        `Yalnızca tamamlanmış ödemeler iptal edilebilir. Mevcut durum: ${payment.status}`
      );
    }
  }
}
