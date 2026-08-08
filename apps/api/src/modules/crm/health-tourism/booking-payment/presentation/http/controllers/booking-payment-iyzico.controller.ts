import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@common/decorators/public.decorator';
import { ROUTE_PATHS, THROTTLE_CONFIG } from '@common/constants';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { HandleBookingPaymentIyzicoCallbackCommand } from '@modules/crm/health-tourism/booking-payment/application/commands/handle-iyzico-callback/handle-iyzico-callback.command';

/**
 * Sağlık turizmi (otel/transfer) ödemesinin iyzico callback'i. iyzico ödeme tamamlandıktan
 * sonra form-encoded { token, conversationId, signature } gönderir; conversationId =
 * bookingPaymentId. Doğrulama + book replay handler'da yapılır.
 */
@Controller(ROUTE_PATHS.BOOKING_PAYMENTS.IYZICO_ROOT)
export class BookingPaymentIyzicoController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Post(ROUTE_PATHS.BOOKING_PAYMENTS.CALLBACK)
  @Public()
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  @HttpCode(HttpStatus.OK)
  async handleCallback(
    @Body('token') token: string,
    @Body('conversationId') conversationId: string
  ): Promise<{ received: true }> {
    await this.commandBus.execute(
      new HandleBookingPaymentIyzicoCallbackCommand(token, conversationId)
    );
    return { received: true };
  }
}
