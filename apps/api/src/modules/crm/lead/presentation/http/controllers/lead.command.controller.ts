import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  ConvertLeadDto,
  CreateLeadDto,
  MarkLeadLostDto,
  MoveLeadToStageDto,
  UpdateLeadStatusDto,
} from '@shared/modules/lead/dto/commands';
import { CreateLeadCommand } from '@modules/crm/lead/application/commands/create-lead/create-lead.command';
import { UpdateLeadStatusCommand } from '@modules/crm/lead/application/commands/update-lead-status/update-lead-status.command';
import { ConvertLeadCommand } from '@modules/crm/lead/application/commands/convert-lead/convert-lead.command';
import { MarkLeadLostCommand } from '@modules/crm/lead/application/commands/mark-lead-lost/mark-lead-lost.command';
import { MoveLeadToStageCommand } from '@modules/crm/lead/application/commands/move-lead-to-stage/move-lead-to-stage.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { LEAD } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class LeadCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(LEAD.create)
  @Post('clinics/:clinicId/leads')
  createLead(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: CreateLeadDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CreateLeadCommand({ data: dto, clinicId, ctx })
    );
  }

  @HasCapability(LEAD.update)
  @Put('leads/:leadId/status')
  updateStatus(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body() dto: UpdateLeadStatusDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateLeadStatusCommand({ leadId, data: dto, ctx })
    );
  }

  @HasCapability(LEAD.update)
  @Put('leads/:leadId/convert')
  convertLead(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body() dto: ConvertLeadDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ConvertLeadCommand({ leadId, data: dto, ctx })
    );
  }

  @HasCapability(LEAD.update)
  @Put('leads/:leadId/lost')
  markLost(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body() dto: MarkLeadLostDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new MarkLeadLostCommand({ leadId, data: dto, ctx })
    );
  }

  @HasCapability(LEAD.update)
  @Put('leads/:leadId/stage')
  moveToStage(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body() dto: MoveLeadToStageDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new MoveLeadToStageCommand({ leadId, data: dto, ctx })
    );
  }
}
