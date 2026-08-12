import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicGovernmentSpecsQuery } from '@modules/organization/clinic-governance/application/queries/get-clinic-government-specs/get-clinic-government-specs.query';
import { Serialize } from '@common/decorators/serialize.decorator';
import { ClinicGovernmentSpecsResponseDto } from '@modules/organization/clinic-governance/presentation/dto/clinic-government-specs-response.dto';
import type { ClinicGovernmentSpecsView } from '@modules/organization/clinic-governance/application/queries/get-clinic-government-specs/get-clinic-government-specs.response';
import { HasCapability } from '@common/decorators';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { CLINICGOVERNMENTSPECS } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(CLINICGOVERNMENTSPECS.read)
@Controller('clinics/:clinicId/specs')
export class GovernanceQueryController {
  constructor(private readonly queryBus: TSQueryBus) {}
  @Get()
  @Serialize<ClinicGovernmentSpecsView, ClinicGovernmentSpecsResponseDto>(
    ClinicGovernmentSpecsResponseDto
  )
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicGovernmentSpecsQuery(clinicId, ctx)
    );
  }
}
