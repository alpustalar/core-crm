import { Module } from '@nestjs/common';
import { AppointmentPresentationModule } from '@modules/clinical/appointment/presentation/presentation.module';

@Module({ imports: [AppointmentPresentationModule] })
export class AppointmentModule {}
