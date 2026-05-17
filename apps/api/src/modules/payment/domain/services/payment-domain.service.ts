import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IyzicoTransactionStatus, PaymentStatus } from '@prisma/client';
import { IyzicoTransaction, Payment } from '@shared';
import { IyzicoSdkStatus } from '@src/infrastructure/payment/providers/iyzico';

interface checkIyzicoSdkStatusOrThrowInput {
  status: string;
  sdkErrorMessage?: string;
  action: string;
  paymentId: string;
  conversationId: string;
}
@Injectable()
export class PaymentDomainService {
  readonly logger = new Logger(PaymentDomainService.name);

  isAlreadyProcessed(
    iyzicoTx: IyzicoTransaction,
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

  validateRefundEligibilityOrThrow(payment: Payment) {
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

  checkIyzicoSdkStatusOrThrow(input: checkIyzicoSdkStatusOrThrowInput) {
    const { status, action, sdkErrorMessage, paymentId, conversationId } =
      input;

    if (status?.toLowerCase() !== IyzicoSdkStatus.SUCCESS.toLowerCase()) {
      this.logger.warn(
        `İyzico işlemi başarısız: - ${action} - ${sdkErrorMessage}`,
        {
          paymentId,
          conversationId,
        }
      );

      throw new BadRequestException(
        `İşlem gerçekleştirilemedi: ${action} 'Bilinmeyen hata'}`
      );
    }
  }

  paymentIsCompleteOrThrow(payment: Payment) {
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        `Yalnızca tamamlanmış ödemeler iptal edilebilir. Mevcut durum: ${payment.status}`
      );
    }
  }
}
