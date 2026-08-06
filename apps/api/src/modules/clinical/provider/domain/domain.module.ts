import { Module } from '@nestjs/common';
import { ProviderDomainServicesModule } from '@modules/clinical/provider/domain/services/services.module';

@Module({
  imports: [ProviderDomainServicesModule],
  exports: [ProviderDomainServicesModule],
})
export class ProviderDomainModule {}
