import { InitCheckoutFormInput } from '@modules/payment/application/use-cases/iyzico/commands/init-checkout-form/init-checkout-form.use-case';
import { HandleCallbackInput } from '@modules/payment/application/use-cases/iyzico/commands/handle-payment/handle-payment-callback.use-case';

export const PAYMENT_MODULE_API_TOKEN = Symbol('IPaymentModuleApi');

export interface InitCheckoutFormResult {
  paymentPageUrl: string;
  conversationId: string;
}

export interface IPaymentModuleApi {
  initCheckoutForm(input: InitCheckoutFormInput): Promise<InitCheckoutFormResult>;
  handleCallback(input: HandleCallbackInput): Promise<void>;
  cancelPayment(input: { paymentId: string; ip: string }): Promise<void>;
}
