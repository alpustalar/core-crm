import { Module } from '@nestjs/common';
import { ActivityRepositoriesModule } from '@modules/crm/activity/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [ActivityRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class ActivityInfrastructureModule {}
