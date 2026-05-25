import { Module } from '@nestjs/common';
import { GetLeadsHandler } from './get-leads/get-leads.handler';
import { GetLeadByIdHandler } from './get-lead-by-id/get-lead-by-id.handler';
import { LeadRepositoryModule } from '@modules/lead/infrastructure/persistence/prisma/repositories/lead/lead.repository.module';

export const LEAD_QUERY_HANDLERS = [GetLeadsHandler, GetLeadByIdHandler];

@Module({
  imports: [LeadRepositoryModule],
  providers: LEAD_QUERY_HANDLERS,
  exports: LEAD_QUERY_HANDLERS,
})
export class LeadQueryModule {}
