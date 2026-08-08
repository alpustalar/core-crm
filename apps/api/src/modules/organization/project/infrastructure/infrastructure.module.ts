import { Module } from '@nestjs/common';
import { ProjectRepositoriesModule } from '@modules/organization/project/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [ProjectRepositoriesModule];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class ProjectInfrastructureModule {}
