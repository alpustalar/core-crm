import {
  Body,
  Controller,
  Delete,
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
import { ConnectMetaAccountDto } from '@shared/modules/meta-ads/dto/commands';
import {
  GetMetaLeadsDto,
  GetMetaReportDto,
} from '@shared/modules/meta-ads/dto/queries';
import { ConnectMetaAccountCommand } from '@modules/crm/meta-ads/application/commands/connect-meta-account/connect-meta-account.command';
import { MatchLeadToPatientCommand } from '@modules/crm/meta-ads/application/commands/match-lead-to-patient/match-lead-to-patient.command';
import { GetMetaReportQuery } from '@modules/crm/meta-ads/application/queries/get-meta-report/get-meta-report.query';
import { GetMetaLeadsQuery } from '@modules/crm/meta-ads/application/queries/get-meta-leads/get-meta-leads.query';
import { GetMetaAccountsQuery } from '@modules/crm/meta-ads/application/queries/get-meta-accounts/get-meta-accounts.query';
import { MetaLeadStatus } from '@prisma/client';
import { PaginationDto } from '@shared';

@UseGuards(AuthGuard)
@Controller()
export class MetaAdsController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post('clinics/:clinicId/accounts')
  connectAccount(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: ConnectMetaAccountDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ConnectMetaAccountCommand(dto, clinicId, ctx)
    );
  }

  @Delete('clinics/:clinicId/accounts/:accountId')
  disconnectAccount() {
    // TODO: DisconnectMetaAccountCommand handler ekle
  }

  @Get('clinics/:clinicId/accounts')
  getAccounts(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetMetaAccountsQuery(clinicId, ctx));
  }

  @Get('clinics/:clinicId/reports')
  getReport(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Query() dto: GetMetaReportDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetMetaReportQuery(clinicId, dto.from, dto.to, ctx, dto.campaignId)
    );
  }

  @Get('clinics/:clinicId/leads')
  getLeads(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Query() dto: GetMetaLeadsDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetMetaLeadsQuery(
        clinicId,
        pagination,
        ctx,
        dto.status as MetaLeadStatus | undefined
      )
    );
  }

  @Put('leads/:leadId/match')
  matchLead(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body('patientId', ParseUUIDPipe) patientId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new MatchLeadToPatientCommand(leadId, patientId, ctx)
    );
  }
}
