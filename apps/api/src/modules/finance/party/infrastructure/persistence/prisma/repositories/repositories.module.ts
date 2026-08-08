import { Module } from '@nestjs/common';
import { PartyRepositoryModule } from '@modules/finance/party/infrastructure/persistence/prisma/repositories/party/party.repository.module';

const RepositoriesModules = [PartyRepositoryModule];

@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class PartyRepositoriesModule {}
