import { Module } from '@nestjs/common';
import { LeadCommandRepository } from './lead.command.repository';
import { LeadQueryRepository } from './lead.query.repository';
import { LEAD_COMMAND_REPOSITORY } from '@modules/crm/lead/domain/repositories/lead/lead.command.repository';
import { LEAD_QUERY_REPOSITORY } from '@modules/crm/lead/domain/repositories/lead/lead.query.repository';

@Module({
  providers: [
    { provide: LEAD_COMMAND_REPOSITORY, useClass: LeadCommandRepository },
    { provide: LEAD_QUERY_REPOSITORY, useClass: LeadQueryRepository },
  ],
  exports: [LEAD_COMMAND_REPOSITORY, LEAD_QUERY_REPOSITORY],
})
export class LeadRepositoryModule {}
