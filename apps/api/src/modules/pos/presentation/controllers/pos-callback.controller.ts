import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { HandlePosCallbackCommand } from '@modules/pos/application/commands/handle-pos-callback/handle-pos-callback.command';

@Controller('pos/callback')
export class PosCallbackController {
  private readonly logger = new Logger(PosCallbackController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post(':externalRef')
  async handle(@Param('externalRef') externalRef: string, @Body() body: unknown) {
    this.logger.log(`POS callback alındı: externalRef=${externalRef}`);
    return this.commandBus.execute(
      new HandlePosCallbackCommand({ externalRef, rawPayload: body })
    );
  }
}
