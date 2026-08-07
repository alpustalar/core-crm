import { Module } from '@nestjs/common';
import { AppointmentDomainServicesModule } from '@modules/clinical/appointment/domain/services/services.module';

const DomainModules = [AppointmentDomainServicesModule];
@Module({
  imports: [...DomainModules],
  exports: [...DomainModules],
})
export class AppointmentDomainModule {}
