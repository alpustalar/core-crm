import { Module } from '@nestjs/common';
import { AppointmentApplicationModule } from '@modules/clinical/appointment/application/application.module';
import { AppointmentDomainModule } from '@modules/clinical/appointment/domain/domain.module';
import { AppointmentInfrastructureModule } from '@modules/clinical/appointment/infrastructure/infrastructure.module';
import { AppointmentPresentationModule } from '@modules/clinical/appointment/presentation/presentation.module';

@Module({
  imports: [
    AppointmentApplicationModule,
    AppointmentDomainModule,
    AppointmentInfrastructureModule,
    AppointmentPresentationModule,
  ],
})
export class AppointmentModule {}
