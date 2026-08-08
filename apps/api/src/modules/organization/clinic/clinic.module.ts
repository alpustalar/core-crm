import { Module } from '@nestjs/common';
import { ClinicPresentationModule } from '@modules/organization/clinic/presentation/presentation.module';
import { ClinicDomainServicesModule } from '@modules/organization/clinic/domain/services/services.module';

@Module({
  imports: [ClinicPresentationModule, ClinicDomainServicesModule],
  exports: [ClinicDomainServicesModule],
})
export class ClinicModule {}
