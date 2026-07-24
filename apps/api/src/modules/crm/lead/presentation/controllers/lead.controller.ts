import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
import {
  ConvertLeadDto,
  CreateLeadDto,
  MarkLeadLostDto,
  MoveLeadToStageDto,
  UpdateLeadStatusDto,
} from '@shared/modules/lead/dto/commands';
import { GetLeadsDto } from '@shared/modules/lead/dto/queries';
import { CreateLeadCommand } from '@modules/crm/lead/application/commands/create-lead/create-lead.command';
import { UpdateLeadStatusCommand } from '@modules/crm/lead/application/commands/update-lead-status/update-lead-status.command';
import { ConvertLeadCommand } from '@modules/crm/lead/application/commands/convert-lead/convert-lead.command';
import { MarkLeadLostCommand } from '@modules/crm/lead/application/commands/mark-lead-lost/mark-lead-lost.command';
import { MoveLeadToStageCommand } from '@modules/crm/lead/application/commands/move-lead-to-stage/move-lead-to-stage.command';
import { GetLeadsQuery } from '@modules/crm/lead/application/queries/get-leads/get-leads.query';
import { GetLeadByIdQuery } from '@modules/crm/lead/application/queries/get-lead-by-id/get-lead-by-id.query';

@UseGuards(AuthGuard)
@Controller()
export class LeadController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

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

  @Get('clinics/:clinicId/leads')
  getLeads(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Query() dto: GetLeadsDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetLeadsQuery({ clinicId, data: dto, pagination, ctx })
    );
  }

  @Get('leads/:leadId')
  getLeadById(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetLeadByIdQuery(leadId, ctx));
  }

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
