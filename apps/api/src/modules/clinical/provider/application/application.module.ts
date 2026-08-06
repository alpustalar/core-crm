import { Module } from '@nestjs/common';
import { ProviderAiToolsModule } from '@modules/clinical/provider/application/ai-tools/provider-ai-tools.module';
import { ProviderCommandsModule } from '@modules/clinical/provider/application/commands/commands.module';
import { ProviderQueriesModule } from '@modules/clinical/provider/application/queries/queries.module';

const ApplicationModules = [
  ProviderAiToolsModule,
  ProviderCommandsModule,
  ProviderQueriesModule,
];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class ProviderApplicationModule {}
