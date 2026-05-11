import { Module } from '@nestjs/common';
import { AppointmentModuleApi } from '@modules/appointment/appointment-module.api';
import { AppointmentUseCaseModule } from '@modules/appointment/application/use-cases/appointment-use-case.module';
import { AppointmentPresentationModule } from '@modules/appointment/presentation/appointment-presentation.module';

@Module({
  imports: [AppointmentUseCaseModule, AppointmentPresentationModule],
  providers: [AppointmentModuleApi],
  exports: [AppointmentModuleApi],
})
export class AppointmentModule {}
