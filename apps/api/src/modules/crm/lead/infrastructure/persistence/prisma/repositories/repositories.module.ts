import { Module } from '@nestjs/common';
import { LeadRepositoryModule } from '@modules/crm/lead/infrastructure/persistence/prisma/repositories/lead/lead.repository.module';

const RepositoriesModules = [LeadRepositoryModule];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class LeadRepositoriesModule {}
