import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ConfigureHealthTourismConfigDto } from '@shared/modules/health-tourism/dto/commands';
import { ConfigureClinicHealthTourismCommand } from '@modules/crm/health-tourism/config/application/commands/configure-clinic-health-tourism/configure-clinic-health-tourism.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { CLINICHEALTHTOURISMCONFIG } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class ClinicHealthTourismConfigCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(CLINICHEALTHTOURISMCONFIG.update)
  @Patch('health-tourism/clinics/:clinicId/config')
  configure(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: ConfigureHealthTourismConfigDto,
    @GetContext() ctx: IGetContext,
    @Query('organizationId', ParseUUIDPipe) organizationId?: string | null
  ) {
    return this.commandBus.execute(
      new ConfigureClinicHealthTourismCommand({
        clinicId,
        organizationId,
        data: dto,
        ctx,
      })
    );
  }
}
