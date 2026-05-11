import { Module } from '@nestjs/common';
import {
  ClinicCreatedListener,
  ClinicDeletedListener,
} from '@modules/clinic/infrastructure/events/listeners';
import { CLINIC_EVENT_PUBLISHER_TOKEN } from '@modules/clinic/domain/interfaces/clinic.event-publisher.interface';
import { ClinicEventPublisher } from '@modules/clinic/infrastructure/events/publisher/clinic.event-publisher';

@Module({
  providers: [
    ClinicCreatedListener,
    ClinicDeletedListener,
    {
      provide: CLINIC_EVENT_PUBLISHER_TOKEN,
      useClass: ClinicEventPublisher,
    },
  ],
  exports: [CLINIC_EVENT_PUBLISHER_TOKEN],
})
export class ClinicEventModule {}
