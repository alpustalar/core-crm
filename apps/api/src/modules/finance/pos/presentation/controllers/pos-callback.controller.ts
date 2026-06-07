import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { HandlePosCallbackCommand } from '@modules/finance/pos/application/commands/handle-pos-callback/handle-pos-callback.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Controller('callback')
export class PosCallbackController {
  private readonly logger = new Logger(PosCallbackController.name);

  constructor(private readonly commandBus: TSCommandBus) {}

  @Post(':externalRef')
  async handle(
    @Param('externalRef') externalRef: string,
    @Body() body: unknown
  ) {
    this.logger.log(`POS callback alındı: externalRef=${externalRef}`);
    return this.commandBus.execute(
      new HandlePosCallbackCommand({ externalRef, rawPayload: body })
    );
  }
}
