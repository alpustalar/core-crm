import { Module } from '@nestjs/common';
import { AppointmentDomainServicesModule } from '@modules/clinical/appointment/domain/services/services.module';

const Modules = [AppointmentDomainServicesModule];
@Module({
  imports: Modules,
  exports: Modules,
})
export class AppointmentDomainModule {}
