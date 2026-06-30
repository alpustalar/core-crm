import { ICommand } from '@nestjs/cqrs';

/**
 * iyzico CheckoutForm callback'ini işler: token ile ödemeyi doğrular (retrieveCheckoutForm) ve
 * başarılıysa ConfirmBookingPaymentCommand'a köprüler. conversationId = bookingPaymentId.
 */
export class HandleBookingPaymentIyzicoCallbackCommand implements ICommand {
  constructor(
    public readonly token: string,
    public readonly conversationId: string
  ) {}
}
