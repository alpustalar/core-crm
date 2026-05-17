export const BILLING_ADAPTER_TOKEN = Symbol('IBillingAdapter');

export interface SubscriptionBuyerInfo {
  id: string;
  name: string;
  surname: string;
  email: string;
  gsmNumber: string;
  ip: string;
  city?: string;
  address?: string;
}

export interface InitSubscriptionPaymentInput {
  organizationId: string;
  amount: number;
  label: string;
  buyer: SubscriptionBuyerInfo;
}

export interface PaymentResult {
  success: boolean;
  iyzicoPaymentId?: string;
  errorMessage?: string;
}

export interface IBillingAdapter {
  initializePayment(
    input: InitSubscriptionPaymentInput
  ): Promise<{ checkoutUrl: string; conversationId: string }>;
  handlePaymentResult(token: string): Promise<PaymentResult>;
  cancelPayment(iyzicoPaymentId: string, ip: string): Promise<void>;
}
