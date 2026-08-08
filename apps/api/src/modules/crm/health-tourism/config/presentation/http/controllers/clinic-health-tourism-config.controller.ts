import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ConfigureHealthTourismConfigDto } from '@shared/modules/health-tourism/dto/commands';
import { ConfigureClinicHealthTourismCommand } from '@modules/crm/health-tourism/config/application/commands/configure-clinic-health-tourism/configure-clinic-health-tourism.command';
import { GetClinicHealthTourismConfigQuery } from '@modules/crm/health-tourism/config/application/queries/get-clinic-health-tourism-config/get-clinic-health-tourism-config.query';

@UseGuards(AuthGuard)
@Controller()
export class ClinicHealthTourismConfigController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Get('health-tourism/clinics/:clinicId/config')
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicHealthTourismConfigQuery(clinicId, ctx)
    );
  }

  @Patch('health-tourism/clinics/:clinicId/config')
  configure(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: ConfigureHealthTourismConfigDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ConfigureClinicHealthTourismCommand({ clinicId, data: dto, ctx })
    );
  }
}
