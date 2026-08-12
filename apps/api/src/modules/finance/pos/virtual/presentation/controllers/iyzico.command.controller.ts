import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { Public } from '@common/decorators/public.decorator';
import {
  GetContext,
  HasCapability,
  IGetContext,
  UserIp,
} from '@common/decorators';
import {
  CancelPaymentDto,
  InitCheckoutFormDto,
  RefundPaymentDto,
} from '@shared';
import { ROUTE_PATHS, THROTTLE_CONFIG } from '@common/constants';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { HandlePaymentCallbackCommand } from '@modules/finance/pos/virtual/application/commands/iyzico/handle-payment-callback/handle-payment-callback.command';
import { InitCheckoutFormCommand } from '@modules/finance/pos/virtual/application/commands/iyzico/init-checkout-form/init-checkout-form.command';
import { CancelPaymentCommand } from '@modules/finance/pos/virtual/application/commands/iyzico/cancel-payment/cancel-payment.command';
import { RefundPaymentCommand } from '@modules/finance/pos/virtual/application/commands/iyzico/refund-payment/refund-payment.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { PAYMENT } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller(ROUTE_PATHS.PAYMENTS.IYZICO.ROOT)
export class IyzicoCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(PAYMENT.create)
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

  @HasCapability(PAYMENT.update)
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  cancelPayment(
    @Body() dto: CancelPaymentDto,
    @UserIp() ip: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CancelPaymentCommand(dto, ip, ctx));
  }

  @HasCapability(PAYMENT.update)
  @Post('refund')
  @HttpCode(HttpStatus.OK)
  refundPayment(@Body() dto: RefundPaymentDto, @UserIp() ip: string) {
    return this.commandBus.execute(new RefundPaymentCommand(dto.paymentId, ip));
  }
}
