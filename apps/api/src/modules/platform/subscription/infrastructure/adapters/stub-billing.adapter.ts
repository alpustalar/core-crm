import { Injectable } from '@nestjs/common';
import {
  ChargeSavedCardInput,
  IBillingAdapter,
  InitSubscriptionPaymentInput,
  PaymentResult,
} from './billing-adapter.interface';

@Injectable()
export class StubBillingAdapter implements IBillingAdapter {
  async initializePayment(
    _input: InitSubscriptionPaymentInput
  ): Promise<{ checkoutUrl: string; conversationId: string }> {
    return { checkoutUrl: '', conversationId: '' };
  }

  async handlePaymentResult(_token: string): Promise<PaymentResult> {
    return { success: true };
  }

  async chargeSavedCard(_input: ChargeSavedCardInput): Promise<PaymentResult> {
    return { success: true };
  }

  async cancelPayment(_iyzicoPaymentId: string, _ip: string): Promise<void> {}
}
