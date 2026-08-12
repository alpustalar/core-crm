import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { UpsertClinicGovernmentSpecsDto } from '@shared';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { UpsertClinicGovernmentSpecsCommand } from '@modules/organization/clinic-governance/application/commands/upsert-clinic-government-specs/upsert-clinic-government-specs.command';
import { HasCapability } from '@common/decorators';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { CLINICGOVERNMENTSPECS } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('clinics/:clinicId/specs')
export class GovernanceCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(CLINICGOVERNMENTSPECS.update)
  @Put()
  upsert(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: UpsertClinicGovernmentSpecsDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpsertClinicGovernmentSpecsCommand({ clinicId, data: dto, ctx })
    );
  }
}
