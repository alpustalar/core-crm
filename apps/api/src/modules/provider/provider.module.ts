import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProviderController } from '@modules/provider/presentation/controllers';
import { ProviderPresentationModule } from '@modules/provider/presentation/provider-presentation.module';
import { ProviderModuleApi } from '@modules/provider/provider-module.api';
import { ProviderCommandsModule } from '@modules/provider/application/commands/commands.module';
import { ProviderQueriesModule } from '@modules/provider/application/queries/queries.module';

@Module({
  imports: [CqrsModule, ProviderPresentationModule, ProviderCommandsModule, ProviderQueriesModule],
  controllers: [ProviderController],
  providers: [ProviderModuleApi],
  exports: [ProviderModuleApi],
})
export class ProviderModule {}
