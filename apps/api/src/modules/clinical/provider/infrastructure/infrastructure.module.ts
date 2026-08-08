import { Module } from '@nestjs/common';
import { ProviderEventModule } from '@modules/clinical/provider/infrastructure/messaging/events/provider-event.module';
import { ProviderRepositoriesModule } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [ProviderEventModule, ProviderRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class ProviderInfrastructureModule {}
