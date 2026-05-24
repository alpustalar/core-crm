import type { IyzicoTerminalCredentials } from '../auth/iyzico-terminal-auth.types';

export type IyzicoTerminalSalesType = 'SALE' | 'PRE_AUTH' | 'POST_AUTH';

export interface IyzicoTerminalCompletePaymentInput {
  credentials: IyzicoTerminalCredentials;
  /** Terminal cihazının benzersiz kimliği */
  deviceUniqueId: string;
  /** İstek-yanıt eşleşmesi için üye işyeri tarafından belirlenir */
  conversationId: string;
  /** Bu işleme ait benzersiz referans numarası */
  transactionReferenceId: string;
  price: number;
  currency: string;
  salesType: IyzicoTerminalSalesType;
  /** 0 = tek çekim */
  installment: number;
  /** POST_AUTH işlemlerinde zorunlu */
  paymentId?: string;
  locale?: 'tr' | 'en';
}

export interface IyzicoTerminalVoidPaymentInput {
  credentials: IyzicoTerminalCredentials;
  deviceUniqueId: string;
  conversationId: string;
  transactionReferenceId: string;
  /** iyzico tarafından üretilen ödeme kimliği */
  paymentId: string;
  /** İşlemin muhasebeleştirildiği tarih (YYYYMMDD) */
  paymentDate: string;
  reason?: string;
  description?: string;
  locale?: 'tr' | 'en';
}

export interface IyzicoTerminalEodInput {
  credentials: IyzicoTerminalCredentials;
  deviceUniqueId: string;
  conversationId: string;
  /** true: detaylı işlem özeti döner */
  useSummary?: boolean;
  locale?: 'tr' | 'en';
}

export interface IyzicoTerminalEodResult {
  status: 'SUCCESS' | 'FAILURE';
  conversationId: string;
  batchNo?: string;
  saleCount?: number;
  saleAmount?: number;
  voidCount?: number;
  voidAmount?: number;
  refundCount?: number;
  refundAmount?: number;
  currency?: string;
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
}

export interface IyzicoTerminalRefundPaymentInput {
  credentials: IyzicoTerminalCredentials;
  deviceUniqueId: string;
  conversationId: string;
  transactionReferenceId: string;
  /** İade yapılacak orijinal ödeme kimliği */
  paymentId: string;
  /** İade tutarı — orijinal tutardan büyük olamaz */
  price: number;
  /** İşlemin muhasebeleştirildiği tarih (YYYYMMDD) */
  paymentDate: string;
  reason?: string;
  description?: string;
  locale?: 'tr' | 'en';
}

export interface IyzicoTerminalRefundPaymentResult {
  status: 'SUCCESS' | 'FAILURE';
  conversationId: string;
  transactionReferenceId: string;
  paymentId: string;
  paymentDate: string;
  price?: number;
  currency?: string;
  authCode?: string;
  hostReference?: string;
  refundHostReference?: string;
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
}

export interface IyzicoTerminalVoidPaymentResult {
  status: 'SUCCESS' | 'FAILURE';
  conversationId: string;
  transactionReferenceId: string;
  paymentId: string;
  paymentDate: string;
  price?: number;
  currency?: string;
  authCode?: string;
  hostReference?: string;
  cancelHostReference?: string;
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
}

export interface IyzicoTerminalPaymentResult {
  status: 'SUCCESS' | 'FAILURE';
  conversationId: string;
  transactionReferenceId: string;
  /** Banka onay kodu */
  authCode?: string;
  /** iyzico tarafından üretilen ödeme kimliği */
  paymentId?: string;
  paymentDate?: string;
  price: number;
  currency: string;
  installment: number;
  binNumber?: string;
  lastFourDigits?: string;
  cardType?: string;
  hostReference?: string;
  batchNo?: string;
  stanNo?: string;
  bankMerchantId?: string;
  bankTerminalId?: string;
  posEntryModeCode?: string;
  transactionDateTime?: string;
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
}
