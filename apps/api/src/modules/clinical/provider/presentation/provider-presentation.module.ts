import { Module } from '@nestjs/common';
import { ProviderController } from '@modules/clinical/provider/presentation/controllers';
import { ProviderQueriesModule } from '@modules/clinical/provider/application/queries/queries.module';
import { ProviderCommandsModule } from '@modules/clinical/provider/application/commands/commands.module';

@Module({
  imports: [ProviderQueriesModule, ProviderCommandsModule],
  controllers: [ProviderController],
})
export class ProviderPresentationModule {}
