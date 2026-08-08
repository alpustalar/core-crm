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
import { TokenAuthGuard } from '@src/auth';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ConnectInstagramChannelDto } from '@shared/modules/messaging/dto/commands';
import { ConnectClinicInstagramChannelCommand } from '@modules/channel-config/application/commands/connect-clinic-instagram-channel/connect-clinic-instagram-channel.command';
import { DisconnectClinicInstagramChannelCommand } from '@modules/channel-config/application/commands/disconnect-clinic-instagram-channel/disconnect-clinic-instagram-channel.command';
import { GetClinicInstagramChannelQuery } from '@modules/channel-config/application/queries/get-clinic-instagram-channel/get-clinic-instagram-channel.query';

@UseGuards(TokenAuthGuard)
@Controller('clinics/:clinicId/instagram-channel')
export class InstagramChannelController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post('connect')
  connect(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: ConnectInstagramChannelDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ConnectClinicInstagramChannelCommand({
        clinicId,
        input: {
          code: dto.code,
          igUserId: dto.igUserId,
          pageId: dto.pageId,
          username: dto.username,
        },
        ctx,
      })
    );
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  disconnect(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new DisconnectClinicInstagramChannelCommand(clinicId, ctx)
    );
  }

  @Get()
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicInstagramChannelQuery(clinicId, ctx)
    );
  }
}
