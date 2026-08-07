import { Module } from '@nestjs/common';
import { LeadPresentationModule } from './presentation/presentation.module';
import { LeadApplicationModule } from '@modules/crm/lead/application/application.module';
import { LeadInfrastructureModule } from '@modules/crm/lead/infrastructure/infrastructure.module';

@Module({
  imports: [
    LeadPresentationModule,
    LeadApplicationModule,
    LeadInfrastructureModule,
  ],
})
export class LeadModule {}
