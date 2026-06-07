import { Module } from '@nestjs/common';
import { ProviderController } from '@modules/clinical/provider/presentation/controllers';
import { ProviderPresentationModule } from '@modules/clinical/provider/presentation/provider-presentation.module';
import { ProviderCommandsModule } from '@modules/clinical/provider/application/commands/commands.module';
import { ProviderQueriesModule } from '@modules/clinical/provider/application/queries/queries.module';

@Module({
  imports: [
    ProviderPresentationModule,
    ProviderCommandsModule,
    ProviderQueriesModule,
  ],
  controllers: [ProviderController],
})
export class ProviderModule {}
