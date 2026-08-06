import { Module } from '@nestjs/common';
import { ProviderController } from '@modules/clinical/provider/presentation/controllers';
import { ProviderApplicationModule } from '@modules/clinical/provider/application/application.module';

@Module({
  imports: [ProviderApplicationModule],
  controllers: [ProviderController],
})
export class ProviderPresentationModule {}
