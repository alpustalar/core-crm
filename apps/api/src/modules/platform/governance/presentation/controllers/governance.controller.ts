import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { UpsertClinicGovernmentSpecsDto } from '@shared';
import { GetContext, IGetContext } from '@common/decorators/get-context.decorator';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { UpsertClinicGovernmentSpecsCommand } from '@modules/platform/governance/application/commands/upsert-clinic-government-specs/upsert-clinic-government-specs.command';
import { GetClinicGovernmentSpecsQuery } from '@modules/platform/governance/application/queries/get-clinic-government-specs/get-clinic-government-specs.query';

/**
 * Kliniğin devlet/regülasyon kimliği (SKRS tesis kodu, USS, VKN). Clinic
 * modülünden ayrıştırılmış platform/governance bounded-context endpoint'leri.
 */
@UseGuards(AuthGuard)
@Controller('clinics/:clinicId/specs')
export class GovernanceController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Put()
  upsert(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: UpsertClinicGovernmentSpecsDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpsertClinicGovernmentSpecsCommand(clinicId, dto, ctx)
    );
  }

  @Get()
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicGovernmentSpecsQuery(clinicId, ctx)
    );
  }
}
