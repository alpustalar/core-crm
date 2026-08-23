import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/interfaces/iyzico.provider.interface';
import { HandleBookingPaymentIyzicoCallbackCommand } from './handle-iyzico-callback.command';
import { ConfirmBookingPaymentCommand } from '../confirm-booking-payment/confirm-booking-payment.command';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { PaymentProviders } from '@common/constants';

@CommandHandler(HandleBookingPaymentIyzicoCallbackCommand)
export class HandleBookingPaymentIyzicoCallbackHandler
  implements ICommandHandler<HandleBookingPaymentIyzicoCallbackCommand, void>
{
  private readonly logger = new Logger(
    HandleBookingPaymentIyzicoCallbackHandler.name
  );

  constructor(
    private readonly commandBus: TSCommandBus,
    @Inject(IYZICO_PROVIDER)
    private readonly iyzico: IIyzicoProvider
  ) {}

  async execute(
    command: HandleBookingPaymentIyzicoCallbackCommand
  ): Promise<void> {
    const { token, conversationId } = command;
    const result = await this.iyzico.retrieveCheckoutForm(token);

    if (!result.isSuccess || !result.paymentTransactionId) {
      this.logger.warn(
        `iyzico booking ödemesi başarısız (bp=${conversationId}): ${
          result.errorMessage ?? 'bilinmeyen'
        }`
      );
      return;
    }

    await this.commandBus.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: conversationId,
        provider: PaymentProviders.IYZICO,
        providerRef: result.paymentTransactionId,
        ctx: ExecutionContextFactory.createInternal(),
      })
    );
  }
}
