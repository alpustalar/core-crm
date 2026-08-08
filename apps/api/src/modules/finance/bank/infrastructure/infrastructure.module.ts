import { Module } from '@nestjs/common';
import { BankRepositoriesModule } from '@modules/finance/bank/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [BankRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class BankInfrastructureModule {}
