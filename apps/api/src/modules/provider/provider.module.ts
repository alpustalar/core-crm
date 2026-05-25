import { Module } from '@nestjs/common';
import { ProviderController } from '@modules/provider/presentation/controllers';
import { ProviderPresentationModule } from '@modules/provider/presentation/provider-presentation.module';
import { ProviderCommandsModule } from '@modules/provider/application/commands/commands.module';
import { ProviderQueriesModule } from '@modules/provider/application/queries/queries.module';

@Module({
  imports: [
    ProviderPresentationModule,
    ProviderCommandsModule,
    ProviderQueriesModule,
  ],
  controllers: [ProviderController],
})
export class ProviderModule {}
