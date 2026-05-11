import { Module } from '@nestjs/common';
import { ProviderController } from '@modules/provider/presentation/controllers';
import { ProviderQueriesModule } from '@modules/provider/application/queries/queries.module';
import { ProviderCommandsModule } from '@modules/provider/application/commands/commands.module';

@Module({
  imports: [ProviderQueriesModule, ProviderCommandsModule],
  controllers: [ProviderController],
})
export class ProviderPresentationModule {}
