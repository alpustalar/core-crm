import { Module } from '@nestjs/common';
import { ProviderController } from '@modules/provider/presentation/controllers';
import { ProviderQueriesModule } from '@modules/provider/application/queries/queries.module';
import { ProviderCommandsModule } from '@modules/provider/application/commands/commands.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [ProviderQueriesModule, ProviderCommandsModule, CqrsModule],
  controllers: [ProviderController],
})
export class ProviderPresentationModule {}
