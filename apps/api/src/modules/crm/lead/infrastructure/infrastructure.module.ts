import { Module } from '@nestjs/common';
import { LeadEventModule } from '@modules/crm/lead/infrastructure/messaging/events/lead-event.module';
import { LeadRepositoriesModule } from '@modules/crm/lead/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [LeadEventModule, LeadRepositoriesModule];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class LeadInfrastructureModule {}
