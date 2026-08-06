import { Module } from '@nestjs/common';
import { ActivityRepositoryModule } from '@modules/crm/activity/infrastructure/persistence/prisma/repositories/activity.repository.module';

const InfrastructureModules = [ActivityRepositoryModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class ActivityInfrastructureModule {}
