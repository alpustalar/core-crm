import { Module } from '@nestjs/common';
import { LeadController } from '@modules/crm/lead/presentation/http/controllers/lead.controller';

@Module({ controllers: [LeadController] })
export class LeadPresentationModule {}
