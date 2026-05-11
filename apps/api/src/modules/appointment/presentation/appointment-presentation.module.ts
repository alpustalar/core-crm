import { Module } from '@nestjs/common';
import { AppointmentUseCaseModule } from '@modules/appointment/application/use-cases/appointment-use-case.module';
import {
  AppointmentController,
  PatientController,
} from '@modules/appointment/presentation/controllers';

@Module({
  imports: [AppointmentUseCaseModule],
  controllers: [AppointmentController, PatientController],
})
export class AppointmentPresentationModule {}
