import { Module } from '@nestjs/common';
import { AppointmentEventPublisher } from '@modules/clinical/appointment/infrastructure/messaging/events/appointment-event-publisher.service';
import { APPOINTMENT_EVENT_PUBLISHER } from '@modules/clinical/appointment/domain/interfaces/appointment-event-publisher.interface';

@Module({
  providers: [
    {
      provide: APPOINTMENT_EVENT_PUBLISHER,
      useClass: AppointmentEventPublisher,
    },
  ],
  exports: [APPOINTMENT_EVENT_PUBLISHER],
})
export class AppointmentEventModule {}
