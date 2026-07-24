import { Module } from '@nestjs/common';
import { CreateLeadHandler } from './create-lead/create-lead.handler';
import { UpdateLeadStatusHandler } from './update-lead-status/update-lead-status.handler';
import { ConvertLeadHandler } from './convert-lead/convert-lead.handler';
import { MarkLeadLostHandler } from './mark-lead-lost/mark-lead-lost.handler';
import { MoveLeadToStageHandler } from './move-lead-to-stage/move-lead-to-stage.handler';
import { LeadRepositoryModule } from '@modules/crm/lead/infrastructure/persistence/prisma/repositories/lead/lead.repository.module';
import { LeadEventModule } from '@modules/crm/lead/infrastructure/events/lead-event.module';

export const LEAD_COMMAND_HANDLERS = [
  CreateLeadHandler,
  UpdateLeadStatusHandler,
  ConvertLeadHandler,
  MarkLeadLostHandler,
  MoveLeadToStageHandler,
];

@Module({
  imports: [LeadRepositoryModule, LeadEventModule],
  providers: LEAD_COMMAND_HANDLERS,
  exports: LEAD_COMMAND_HANDLERS,
})
export class LeadCommandModule {}
