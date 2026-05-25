import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_CONFIG } from '@common/constants';
import { HandleSubscriptionCallbackCommand } from '@modules/subscription/application/commands/handle-subscription-callback/handle-subscription-callback.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Controller()
export class SubscriptionController {
  constructor(private readonly commandBus: TSCommandBus) {}

  /**
   * İyzico'nun abonelik ödemesi tamamlandıktan sonra çağırdığı callback.
   * application/x-www-form-urlencoded formatında { token, conversationId, signature } gönderir.
   */
  @Post('callback')
  @Public()
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  @HttpCode(HttpStatus.OK)
  handleCallback(
    @Body('token') token: string,
    @Body('conversationId') conversationId: string
  ) {
    return this.commandBus.execute(
      new HandleSubscriptionCallbackCommand(token, conversationId)
    );
  }
}
