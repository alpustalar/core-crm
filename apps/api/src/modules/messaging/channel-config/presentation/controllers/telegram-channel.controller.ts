import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ConnectTelegramBotChannelDto } from '@shared/modules/messaging/dto/commands';
import { ConnectClinicTelegramBotChannelCommand } from '@modules/messaging/channel-config/application/commands/connect-clinic-telegram-bot-channel/connect-clinic-telegram-bot-channel.command';
import { DisconnectClinicTelegramChannelCommand } from '@modules/messaging/channel-config/application/commands/disconnect-clinic-telegram-channel/disconnect-clinic-telegram-channel.command';
import { GetClinicTelegramChannelQuery } from '@modules/messaging/channel-config/application/queries/get-clinic-telegram-channel/get-clinic-telegram-channel.query';

@UseGuards(AuthGuard)
@Controller('clinics/:clinicId/telegram-channel')
export class TelegramChannelController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post('connect')
  connect(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: ConnectTelegramBotChannelDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ConnectClinicTelegramBotChannelCommand(
        clinicId,
        { botToken: dto.botToken },
        ctx
      )
    );
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  disconnect(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new DisconnectClinicTelegramChannelCommand(clinicId, ctx)
    );
  }

  @Get()
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicTelegramChannelQuery(clinicId, ctx)
    );
  }
}
