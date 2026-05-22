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
import { GetContext, IGetContext, UserIp } from '@common/decorators';
import {
  CancelPaymentDto,
  GetInstallmentsDto,
  InitCheckoutFormDto,
  RefundPaymentDto,
} from '@shared';

import { ROUTE_PATHS, THROTTLE_CONFIG } from '@common/constants';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { HandlePaymentCallbackCommand } from '@modules/payment/application/commands/iyzico/handle-payment-callback/handle-payment-callback.command';
import { InitCheckoutFormCommand } from '@modules/payment/application/commands/iyzico/init-checkout-form/init-checkout-form.command';
import { CancelPaymentCommand } from '@modules/payment/application/commands/iyzico/cancel-payment/cancel-payment.command';
import { RefundPaymentCommand } from '@modules/payment/application/commands/iyzico/refund-payment/refund-payment.command';
import { GetInstallmentInfoQuery } from '@modules/payment/application/queries/iyzico/get-installment-info/get-installment-info.query';

@UseGuards(AuthGuard)
@Controller(ROUTE_PATHS.PAYMENTS.IYZICO.ROOT)
export class IyzicoController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post('initialize-checkout')
  @HttpCode(HttpStatus.OK)
  initCheckout(@Body() dto: InitCheckoutFormDto, @UserIp() ip: string) {
    return this.commandBus.execute(new InitCheckoutFormCommand(dto, ip));
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
    return this.commandBus.execute(
      new HandlePaymentCallbackCommand(token, conversationId, signature)
    );
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  cancelPayment(
    @Body() dto: CancelPaymentDto,
    @UserIp() ip: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CancelPaymentCommand(dto, ip, ctx));
  }

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  refundPayment(@Body() dto: RefundPaymentDto, @UserIp() ip: string) {
    return this.commandBus.execute(new RefundPaymentCommand(dto.paymentId, ip));
  }

  @Get('installments')
  getInstallmentInfo(@Query() dto: GetInstallmentsDto) {
    return this.queryBus.execute(new GetInstallmentInfoQuery(dto));
  }
}
