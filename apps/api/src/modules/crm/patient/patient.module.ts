import { Module } from '@nestjs/common';
import { PatientApplicationModule } from '@modules/crm/patient/application/application.module';
import { PatientInfrastructureModule } from '@modules/crm/patient/infrastructure/infrastructure.module';

@Module({
  imports: [PatientApplicationModule, PatientInfrastructureModule],
})
export class PatientModule {}
