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
import { AuthGuard } from '@modules/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
import { CreateLeadDto, UpdateLeadStatusDto, ConvertLeadDto, MarkLeadLostDto } from '@shared/modules/lead/dto/commands';
import { GetLeadsDto } from '@shared/modules/lead/dto/queries';
import { CreateLeadCommand } from '@modules/lead/application/commands/create-lead/create-lead.command';
import { UpdateLeadStatusCommand } from '@modules/lead/application/commands/update-lead-status/update-lead-status.command';
import { ConvertLeadCommand } from '@modules/lead/application/commands/convert-lead/convert-lead.command';
import { MarkLeadLostCommand } from '@modules/lead/application/commands/mark-lead-lost/mark-lead-lost.command';
import { GetLeadsQuery } from '@modules/lead/application/queries/get-leads/get-leads.query';
import { GetLeadByIdQuery } from '@modules/lead/application/queries/get-lead-by-id/get-lead-by-id.query';

@UseGuards(AuthGuard)
@Controller()
export class LeadController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus,
  ) {}

  @Post('clinics/:clinicId/leads')
  createLead(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: CreateLeadDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.commandBus.execute(new CreateLeadCommand(dto, clinicId, ctx));
  }

  @Get('clinics/:clinicId/leads')
  getLeads(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Query() dto: GetLeadsDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.queryBus.execute(new GetLeadsQuery(clinicId, dto, pagination, ctx));
  }

  @Get('leads/:leadId')
  getLeadById(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @GetContext() ctx: IGetContext,
  ) {
    return this.queryBus.execute(new GetLeadByIdQuery(leadId, ctx));
  }

  @Put('leads/:leadId/status')
  updateStatus(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body() dto: UpdateLeadStatusDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.commandBus.execute(new UpdateLeadStatusCommand(leadId, dto, ctx));
  }

  @Put('leads/:leadId/convert')
  convertLead(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body() dto: ConvertLeadDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.commandBus.execute(new ConvertLeadCommand(leadId, dto, ctx));
  }

  @Put('leads/:leadId/lost')
  markLost(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body() dto: MarkLeadLostDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.commandBus.execute(new MarkLeadLostCommand(leadId, dto, ctx));
  }
}
