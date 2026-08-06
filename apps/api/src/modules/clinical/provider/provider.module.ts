import { Module } from '@nestjs/common';
import { ProviderPresentationModule } from '@modules/clinical/provider/presentation/provider-presentation.module';
import { ProviderDomainServicesModule } from '@modules/clinical/provider/domain/services/services.module';
import { ProviderApplicationModule } from '@modules/clinical/provider/application/application.module';

@Module({
  imports: [
    ProviderPresentationModule,
    ProviderApplicationModule,
    ProviderDomainServicesModule,
  ],
})
export class ProviderModule {}
