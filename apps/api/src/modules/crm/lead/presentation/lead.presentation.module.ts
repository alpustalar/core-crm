import { Module } from '@nestjs/common';
import { LeadController } from './controllers/lead.controller';
import { LeadCommandModule } from '@modules/crm/lead/application/commands/command.module';
import { LeadQueryModule } from '@modules/crm/lead/application/queries/query.module';

@Module({
  imports: [LeadCommandModule, LeadQueryModule],
  controllers: [LeadController],
})
export class LeadPresentationModule {}
