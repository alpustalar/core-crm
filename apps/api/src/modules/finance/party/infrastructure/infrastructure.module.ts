import { Module } from '@nestjs/common';
import { PartyRepositoriesModule } from '@modules/finance/party/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [PartyRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class PartyInfrastructureModule {}
