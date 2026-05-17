import { Module } from '@nestjs/common';
import {
  ClinicCreatedListener,
  ClinicDeletedListener,
} from '@modules/clinic/infrastructure/events/listeners';
import { CLINIC_EVENT_PUBLISHER_TOKEN } from '@modules/clinic/domain/interfaces/clinic.event-publisher.interface';
import { ClinicEventPublisher } from '@modules/clinic/infrastructure/events/clinic-event-publisher.service';
import { MAIL_SERVICE_TOKEN } from '@modules/mail/domain/interfaces/mail.service.interface';
import { MailService } from '@modules/mail/mail.service';
import { ContextService } from '@src/infrastructure/context';

@Module({
  providers: [
    ClinicCreatedListener,
    ClinicDeletedListener,
    {
      provide: CLINIC_EVENT_PUBLISHER_TOKEN,
      useClass: ClinicEventPublisher,
    },
    {
      provide: MAIL_SERVICE_TOKEN,
      useClass: MailService,
    },
    ContextService,
  ],
  exports: [CLINIC_EVENT_PUBLISHER_TOKEN],
})
export class ClinicEventModule {}
