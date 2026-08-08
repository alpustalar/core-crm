import { Module } from '@nestjs/common';
import { ActivityRepositoryModule } from '@modules/crm/activity/infrastructure/persistence/prisma/repositories/activity/activity.repository.module';

const RepositoriesModules = [ActivityRepositoryModule];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class ActivityRepositoriesModule {}
