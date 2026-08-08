import { Module } from '@nestjs/common';
import { AdminRequestRepositoryModule } from '@modules/platform/admin-request/infrastructure/persistence/prisma/repositories/admin-request/admin-request.repository.module';

const RepositoriesModules = [AdminRequestRepositoryModule];

@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class AdminRequestRepositoriesModule {}
