import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@modules/auth/guards';
import { Public } from '@common/decorators/public.decorator';
import { UserIp } from '@common/decorators';
import {
  CancelPaymentDto,
  GetInstallmentsDto,
  InitCheckoutFormDto,
  RefundPaymentDto,
} from '@shared';
import { InitCheckoutFormUseCase } from '@modules/payment/application/use-cases/iyzico/commands/init-checkout-form/init-checkout-form.use-case';
import { HandlePaymentCallbackUseCase } from '@modules/payment/application/use-cases/iyzico/commands/handle-payment/handle-payment-callback.use-case';
import { CancelPaymentUseCase } from '@modules/payment/application/use-cases/iyzico/commands/cancel-payment/cancel-payment.use-case';
import { RefundPaymentUseCase } from '@modules/payment/application/use-cases/iyzico/commands/refund-payment/refund-payment.use-case';
import { GetInstallmentInfoUseCase } from '@modules/payment/application/use-cases/iyzico/queries/get-installment-info/get-installment-info.use-case';
import { ROUTE_PATHS, THROTTLE_CONFIG } from '@common/constants';

@UseGuards(AuthGuard)
@Controller(ROUTE_PATHS.PAYMENTS.IYZICO.ROOT)
export class IyzicoController {
  constructor(
    private readonly initCheckoutFormUseCase: InitCheckoutFormUseCase,
    private readonly handlePaymentCallbackUseCase: HandlePaymentCallbackUseCase,
    private readonly cancelPaymentUseCase: CancelPaymentUseCase,
    private readonly refundPaymentUseCase: RefundPaymentUseCase,
    private readonly getInstallmentInfoUseCase: GetInstallmentInfoUseCase
  ) {}

  @Post('initialize-checkout')
  @HttpCode(HttpStatus.OK)
  initCheckout(@Body() dto: InitCheckoutFormDto, @UserIp() ip: string) {
    return this.initCheckoutFormUseCase.execute({ ...dto, callbackIp: ip });
  }

  /**
   * İyzico'nun checkout tamamlandıktan sonra çağırdığı webhook.
   * application/x-www-form-urlencoded formatında { token, conversationId, signature } gönderir.
   */
  @Post(ROUTE_PATHS.PAYMENTS.IYZICO.CALLBACK)
  @Public()
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  @HttpCode(HttpStatus.OK)
  handleCallback(
    @Body('token') token: string,
    @Body('conversationId') conversationId: string,
    @Body('signature') signature: string
  ) {
    return this.handlePaymentCallbackUseCase.execute({
      token,
      conversationId,
      signature,
    });
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  cancelPayment(@Body() dto: CancelPaymentDto, @UserIp() ip: string) {
    return this.cancelPaymentUseCase.execute({ paymentId: dto.paymentId, ip });
  }

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  refundPayment(@Body() dto: RefundPaymentDto, @UserIp() ip: string) {
    return this.refundPaymentUseCase.execute({ paymentId: dto.paymentId, ip });
  }

  @Get('installments')
  getInstallmentInfo(@Query() dto: GetInstallmentsDto) {
    return this.getInstallmentInfoUseCase.execute({
      binNumber: dto.binNumber,
      price: dto.price,
    });
  }
}
