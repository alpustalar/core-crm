import { Module } from '@nestjs/common';
import { GetLeadsHandler } from './get-leads/get-leads.handler';
import { GetLeadByIdHandler } from './get-lead-by-id/get-lead-by-id.handler';
import { GetAdAttributedLeadsHandler } from './get-ad-attributed-leads/get-ad-attributed-leads.handler';
import { LeadRepositoriesModule } from '@modules/crm/lead/infrastructure/persistence/prisma/repositories/repositories.module';

export const LEAD_QUERY_HANDLERS = [
  GetLeadsHandler,
  GetLeadByIdHandler,
  GetAdAttributedLeadsHandler,
];

@Module({
  imports: [LeadRepositoriesModule],
  providers: LEAD_QUERY_HANDLERS,
})
export class LeadQueryModule {}
