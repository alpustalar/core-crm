import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  ConnectWhatsappChannelDto,
  RegisterWhatsappChannelDto,
  UpdateWhatsappBusinessProfileDto,
} from '@shared/modules/messaging/dto/commands';
import { RegisterClinicWhatsappChannelCommand } from '@modules/messaging/channel-config/application/commands/register-clinic-whatsapp-channel/register-clinic-whatsapp-channel.command';
import { ConnectClinicWhatsappChannelCommand } from '@modules/messaging/channel-config/application/commands/connect-clinic-whatsapp-channel/connect-clinic-whatsapp-channel.command';
import { DisconnectClinicWhatsappChannelCommand } from '@modules/messaging/channel-config/application/commands/disconnect-clinic-whatsapp-channel/disconnect-clinic-whatsapp-channel.command';
import { UpdateWhatsappBusinessProfileCommand } from '@modules/messaging/channel-config/application/commands/update-whatsapp-business-profile/update-whatsapp-business-profile.command';
import { GetClinicWhatsappChannelQuery } from '@modules/messaging/channel-config/application/queries/get-clinic-whatsapp-channel/get-clinic-whatsapp-channel.query';
import { GetWhatsappTemplatesQuery } from '@modules/messaging/channel-config/application/queries/get-whatsapp-templates/get-whatsapp-templates.query';
import { GetWhatsappChannelHealthQuery } from '@modules/messaging/channel-config/application/queries/get-whatsapp-channel-health/get-whatsapp-channel-health.query';
import { GetWhatsappBusinessProfileQuery } from '@modules/messaging/channel-config/application/queries/get-whatsapp-business-profile/get-whatsapp-business-profile.query';

@UseGuards(AuthGuard)
@Controller('clinics/:clinicId/whatsapp-channel')
export class WhatsappChannelController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  register(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: RegisterWhatsappChannelDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RegisterClinicWhatsappChannelCommand(
        clinicId,
        {
          phoneNumberId: dto.phoneNumberId,
          wabaId: dto.wabaId,
          displayPhoneNumber: dto.displayPhoneNumber,
          accessToken: dto.accessToken,
          verifyToken: dto.verifyToken,
        },
        ctx
      )
    );
  }

  @Post('connect')
  connect(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: ConnectWhatsappChannelDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ConnectClinicWhatsappChannelCommand(
        clinicId,
        {
          code: dto.code,
          wabaId: dto.wabaId,
          phoneNumberId: dto.phoneNumberId,
          displayPhoneNumber: dto.displayPhoneNumber,
        },
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
      new DisconnectClinicWhatsappChannelCommand(clinicId, ctx)
    );
  }

  @Get()
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicWhatsappChannelQuery(clinicId, ctx)
    );
  }

  @Get('templates')
  getTemplates(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetWhatsappTemplatesQuery(clinicId, ctx)
    );
  }

  @Get('health')
  getHealth(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetWhatsappChannelHealthQuery(clinicId, ctx)
    );
  }

  @Get('profile')
  getProfile(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetWhatsappBusinessProfileQuery(clinicId, ctx)
    );
  }

  @Patch('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateProfile(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: UpdateWhatsappBusinessProfileDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateWhatsappBusinessProfileCommand(clinicId, dto, ctx)
    );
  }
}
