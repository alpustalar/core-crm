import { Module } from '@nestjs/common';
import { LeadController } from './controllers/lead.controller';
import { LeadApplicationModule } from '@modules/crm/lead/application/application.module';

@Module({
  imports: [LeadApplicationModule],
  controllers: [LeadController],
})
export class LeadPresentationModule {}
