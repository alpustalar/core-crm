import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants/env.constant';
import { IyzicoTerminalAuthService } from './auth/iyzico-terminal-auth.service';
import type { IyzicoTerminalCredentials } from './auth/iyzico-terminal-auth.types';
import {
  IyzicoTerminalAuthError,
  type IyzicoTerminalErrorGroup,
  IyzicoTerminalOperationError,
} from './iyzico-terminal.errors';
import {
  IYZICO_TERMINAL_PATHS,
  IYZICO_TERMINAL_PROD_BASE_URL,
} from './iyzico-terminal.constants';
import type {
  IyzicoTerminalCompletePaymentInput,
  IyzicoTerminalEodInput,
  IyzicoTerminalEodResult,
  IyzicoTerminalPaymentResult,
  IyzicoTerminalRefundPaymentInput,
  IyzicoTerminalRefundPaymentResult,
  IyzicoTerminalVoidPaymentInput,
  IyzicoTerminalVoidPaymentResult,
} from './types/iyzico-terminal-operation.types';

interface RefundPaymentRequestBody {
  conversationId: string;
  locale: string;
  deviceUniqueId: string;
  transactionReferenceId: string;
  paymentId: string;
  price: number;
  paymentDate: string;
  reason?: string;
  description?: string;
}

interface VoidPaymentRequestBody {
  conversationId: string;
  locale: string;
  deviceUniqueId: string;
  transactionReferenceId: string;
  paymentId: string;
  paymentDate: string;
  reason?: string;
  description?: string;
}

/** iyzico Terminal Host API'ye gönderilen ham istek gövdesi */
interface CompletePaymentRequestBody {
  conversationId: string;
  locale: string;
  deviceUniqueId: string;
  transactionReferenceId: string;
  price: number;
  currency: string;
  saleType: string;
  installment: number;
  paymentId?: string | null;
}

@Injectable()
export class IyzicoTerminalService {
  private readonly logger = new Logger(IyzicoTerminalService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly authService: IyzicoTerminalAuthService,
    config: ConfigService
  ) {
    this.baseUrl =
      config.get<string>(ENV.IYZICO_TERMINAL_BASE_URL) ??
      IYZICO_TERMINAL_PROD_BASE_URL;
  }

  // işlem başlatır

  async completePayment(
    input: IyzicoTerminalCompletePaymentInput
  ): Promise<IyzicoTerminalPaymentResult> {
    const { credentials, deviceUniqueId, locale = 'tr', ...rest } = input;

    const body: CompletePaymentRequestBody = {
      conversationId: rest.conversationId,
      locale,
      deviceUniqueId,
      transactionReferenceId: rest.transactionReferenceId,
      price: rest.price,
      currency: rest.currency,
      saleType: rest.salesType,
      installment: rest.installment,
      paymentId: rest.paymentId ?? null,
    };

    this.logger.log(
      `iyzico terminal ödeme başlatıldı — conversationId=${body.conversationId} device=${deviceUniqueId} amount=${body.price} ${body.currency}`
    );

    const data = await this.callApi<IyzicoTerminalPaymentResult>(
      IYZICO_TERMINAL_PATHS.PAYMENT,
      body,
      credentials
    );

    this.logger.log(
      `iyzico terminal ödeme sonucu — conversationId=${body.conversationId} status=${data.status} authCode=${data.authCode ?? '-'}`
    );

    return {
      status: data.status,
      conversationId: data.conversationId,
      transactionReferenceId: data.transactionReferenceId,
      authCode: data.authCode,
      paymentId: data.paymentId,
      paymentDate: data.paymentDate,
      price: data.price,
      currency: data.currency,
      installment: data.installment,
      binNumber: data.binNumber,
      lastFourDigits: data.lastFourDigits,
      cardType: data.cardType,
      hostReference: data.hostReference,
      batchNo: data.batchNo,
      stanNo: data.stanNo,
      bankMerchantId: data.bankMerchantId,
      bankTerminalId: data.bankTerminalId,
      posEntryModeCode: data.posEntryModeCode,
      transactionDateTime: data.transactionDateTime,
      systemTime: data.systemTime,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
      errorGroup: data.errorGroup,
    };
  }

  // iptal

  async voidPayment(
    input: IyzicoTerminalVoidPaymentInput
  ): Promise<IyzicoTerminalVoidPaymentResult> {
    const { credentials, deviceUniqueId, locale = 'tr', ...rest } = input;

    const body: VoidPaymentRequestBody = {
      conversationId: rest.conversationId,
      locale,
      deviceUniqueId,
      transactionReferenceId: rest.transactionReferenceId,
      paymentId: rest.paymentId,
      paymentDate: rest.paymentDate,
      reason: rest.reason,
      description: rest.description,
    };

    this.logger.log(
      `iyzico terminal iptal başlatıldı — conversationId=${body.conversationId} paymentId=${body.paymentId} paymentDate=${body.paymentDate}`
    );

    const data = await this.callApi<IyzicoTerminalVoidPaymentResult>(
      IYZICO_TERMINAL_PATHS.VOID,
      body,
      credentials
    );

    this.logger.log(
      `iyzico terminal iptal sonucu — conversationId=${body.conversationId} status=${data.status} cancelHostReference=${data.cancelHostReference ?? '-'}`
    );

    return {
      status: data.status,
      conversationId: data.conversationId,
      transactionReferenceId: data.transactionReferenceId,
      paymentId: data.paymentId,
      paymentDate: data.paymentDate,
      price: data.price,
      currency: data.currency,
      authCode: data.authCode,
      hostReference: data.hostReference,
      cancelHostReference: data.cancelHostReference,
      systemTime: data.systemTime,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
      errorGroup: data.errorGroup,
    };
  }

  // iade

  async refundPayment(
    input: IyzicoTerminalRefundPaymentInput
  ): Promise<IyzicoTerminalRefundPaymentResult> {
    const { credentials, deviceUniqueId, locale = 'tr', ...rest } = input;

    const body: RefundPaymentRequestBody = {
      conversationId: rest.conversationId,
      locale,
      deviceUniqueId,
      transactionReferenceId: rest.transactionReferenceId,
      paymentId: rest.paymentId,
      price: rest.price,
      paymentDate: rest.paymentDate,
      reason: rest.reason,
      description: rest.description,
    };

    this.logger.log(
      `iyzico terminal iade başlatıldı — conversationId=${body.conversationId} paymentId=${body.paymentId} price=${body.price}`
    );

    const data = await this.callApi<IyzicoTerminalRefundPaymentResult>(
      IYZICO_TERMINAL_PATHS.REFUND,
      body,
      credentials
    );

    this.logger.log(
      `iyzico terminal iade sonucu — conversationId=${body.conversationId} status=${data.status} refundHostReference=${data.refundHostReference ?? '-'}`
    );

    return {
      status: data.status,
      conversationId: data.conversationId,
      transactionReferenceId: data.transactionReferenceId,
      paymentId: data.paymentId,
      paymentDate: data.paymentDate,
      price: data.price,
      currency: data.currency,
      authCode: data.authCode,
      hostReference: data.hostReference,
      refundHostReference: data.refundHostReference,
      systemTime: data.systemTime,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
      errorGroup: data.errorGroup,
    };
  }

  // gün sonu

  async endOfDay(
    input: IyzicoTerminalEodInput
  ): Promise<IyzicoTerminalEodResult> {
    const { credentials, deviceUniqueId, locale = 'tr', ...rest } = input;

    const body = {
      conversationId: rest.conversationId,
      locale,
      deviceUniqueId,
      useSummary: rest.useSummary,
    };

    this.logger.log(
      `iyzico terminal gün sonu başlatıldı — conversationId=${body.conversationId} device=${deviceUniqueId}`
    );

    const data = await this.callApi<IyzicoTerminalEodResult>(
      IYZICO_TERMINAL_PATHS.EOD,
      body,
      credentials
    );

    this.logger.log(
      `iyzico terminal gün sonu sonucu — conversationId=${body.conversationId} status=${data.status} batchNo=${data.batchNo ?? '-'}`
    );

    return {
      status: data.status,
      conversationId: data.conversationId,
      batchNo: data.batchNo,
      saleCount: data.saleCount,
      saleAmount: data.saleAmount,
      voidCount: data.voidCount,
      voidAmount: data.voidAmount,
      refundCount: data.refundCount,
      refundAmount: data.refundAmount,
      currency: data.currency,
      systemTime: data.systemTime,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
      errorGroup: data.errorGroup,
    };
  }

  // ---------------------------------------------------------------------------
  // private
  // ---------------------------------------------------------------------------

  /**
   * iyzico Terminal endpoint'ine POST atar.
   * 401 alınırsa önbelleği temizleyip token'ı yenileyerek bir kez retry yapar.
   * Credential geçersizse re-login başarısız olur ve hata fırlatılır.
   */
  private async callApi<T>(
    path: string,
    body: unknown,
    credentials: IyzicoTerminalCredentials
  ): Promise<T> {
    const makeRequest = async (token: string): Promise<Response> =>
      fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

    let token = await this.authService.getAccessToken(credentials);
    let res = await makeRequest(token);

    if (res.status === 401) {
      this.logger.warn(
        `iyzico terminal 401 alındı, token yenileniyor — path=${path}`
      );
      this.authService.invalidateToken(credentials.clientId);
      token = await this.authService.getAccessToken(credentials);
      res = await makeRequest(token);
    }

    const data = (await res.json()) as T & {
      status?: string;
      errorCode?: string;
      errorGroup?: IyzicoTerminalErrorGroup;
      errorMessage?: string;
    };

    if (!res.ok && res.status !== 422) {
      throw new IyzicoTerminalAuthError(
        `iyzico terminal isteği başarısız: ${res.status} — path=${path}`,
        res.status,
        data
      );
    }

    if (data.status === 'FAILURE' && data.errorGroup) {
      throw new IyzicoTerminalOperationError(
        data.errorCode ?? 'UNKNOWN',
        data.errorGroup,
        data.errorMessage ?? 'iyzico terminal işlemi başarısız',
        data
      );
    }

    return data;
  }
}
