import { Module } from '@nestjs/common';
import { LeadQueryController } from '@modules/crm/lead/presentation/http/controllers/lead.query.controller';
import { LeadCommandController } from '@modules/crm/lead/presentation/http/controllers/lead.command.controller';

@Module({ controllers: [LeadQueryController, LeadCommandController] })
export class LeadPresentationModule {}
