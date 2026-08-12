import { Module } from '@nestjs/common';
import { CreateLeadHandler } from './create-lead/create-lead.handler';
import { UpdateLeadStatusHandler } from './update-lead-status/update-lead-status.handler';
import { ConvertLeadHandler } from './convert-lead/convert-lead.handler';
import { MarkLeadLostHandler } from './mark-lead-lost/mark-lead-lost.handler';
import { MoveLeadToStageHandler } from './move-lead-to-stage/move-lead-to-stage.handler';
import { LeadInfrastructureModule } from '@modules/crm/lead/infrastructure/infrastructure.module';
import { ClinicDomainServicesModule } from '@modules/organization/clinic/domain/services/services.module';

export const LEAD_COMMAND_HANDLERS = [
  CreateLeadHandler,
  UpdateLeadStatusHandler,
  ConvertLeadHandler,
  MarkLeadLostHandler,
  MoveLeadToStageHandler,
];

@Module({
  imports: [LeadInfrastructureModule, ClinicDomainServicesModule],
  providers: LEAD_COMMAND_HANDLERS,
  exports: LEAD_COMMAND_HANDLERS,
})
export class LeadCommandModule {}
