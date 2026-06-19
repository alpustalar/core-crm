import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { RegisterWhatsappChannelDto } from '@shared/modules/messaging/dto/commands';
import { RegisterClinicWhatsappChannelCommand } from '@modules/messaging/channel-config/application/commands/register-clinic-whatsapp-channel/register-clinic-whatsapp-channel.command';
import { GetClinicWhatsappChannelQuery } from '@modules/messaging/channel-config/application/queries/get-clinic-whatsapp-channel/get-clinic-whatsapp-channel.query';

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

  @Get()
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicWhatsappChannelQuery(clinicId, ctx)
    );
  }
}
