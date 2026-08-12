import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicHealthTourismConfigQuery } from '@modules/crm/health-tourism/config/application/queries/get-clinic-health-tourism-config/get-clinic-health-tourism-config.query';
import { Serialize } from '@common/decorators/serialize.decorator';
import { ClinicHealthTourismConfigResponseDto } from '@modules/crm/health-tourism/config/presentation/http/dto/clinic-health-tourism-config-response.dto';
import type { HealthTourismConfigResponse } from '@shared/modules/health-tourism/interfaces';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { CLINICHEALTHTOURISMCONFIG } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(CLINICHEALTHTOURISMCONFIG.read)
@Controller()
export class ClinicHealthTourismConfigQueryController {
  constructor(private readonly queryBus: TSQueryBus) {}
  @Get('health-tourism/clinics/:clinicId/config')
  @Serialize<HealthTourismConfigResponse, ClinicHealthTourismConfigResponseDto>(
    ClinicHealthTourismConfigResponseDto
  )
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicHealthTourismConfigQuery(clinicId, ctx)
    );
  }
}
