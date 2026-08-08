import { Module } from '@nestjs/common';
import { PurchasingRepositoriesModule } from '@modules/supply/purchasing/infrastructure/persistence/prisma/repositories/repositories.module';

const PurchasingInfrastructureModules = [PurchasingRepositoriesModule];

@Module({
  imports: [...PurchasingInfrastructureModules],
  exports: [...PurchasingInfrastructureModules],
})
export class PurchasingInfrastructureModule {}
