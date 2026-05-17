import { Injectable } from '@nestjs/common';
import {
  IPaymentModuleApi,
  InitCheckoutFormResult,
} from '@modules/payment/domain/interfaces/payment.module.api.interface';
import { InitCheckoutFormUseCase, InitCheckoutFormInput } from '@modules/payment/application/use-cases/iyzico/commands/init-checkout-form/init-checkout-form.use-case';
import { HandlePaymentCallbackUseCase, HandleCallbackInput } from '@modules/payment/application/use-cases/iyzico/commands/handle-payment/handle-payment-callback.use-case';
import { CancelPaymentUseCase } from '@modules/payment/application/use-cases/iyzico/commands';

@Injectable()
export class PaymentModuleApi implements IPaymentModuleApi {
  constructor(
    private readonly initCheckoutFormUseCase: InitCheckoutFormUseCase,
    private readonly handleCallbackUseCase: HandlePaymentCallbackUseCase,
    private readonly cancelPaymentUseCase: CancelPaymentUseCase
  ) {}

  initCheckoutForm(input: InitCheckoutFormInput): Promise<InitCheckoutFormResult> {
    return this.initCheckoutFormUseCase.execute(input);
  }

  handleCallback(input: HandleCallbackInput): Promise<void> {
    return this.handleCallbackUseCase.execute(input);
  }

  cancelPayment({ paymentId, ip }: { paymentId: string; ip: string }): Promise<void> {
    return this.cancelPaymentUseCase.execute({ paymentId, ip });
  }
}
