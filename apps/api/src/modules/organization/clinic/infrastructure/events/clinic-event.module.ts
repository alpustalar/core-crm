import { Module } from '@nestjs/common';
import {
  ClinicCreatedListener,
  ClinicDeletedListener,
} from '@modules/organization/clinic/infrastructure/events/listeners';
import { CLINIC_EVENT_PUBLISHER } from '@modules/organization/clinic/domain/interfaces/clinic.event-publisher.interface';
import { ClinicEventPublisher } from '@modules/organization/clinic/infrastructure/events/clinic-event-publisher.service';
import { MAIL_SERVICE } from '@modules/platform/mail/domain/interfaces/mail.service.interface';
import { MailService } from '@modules/platform/mail/mail.service';

@Module({
  providers: [
    ClinicCreatedListener,
    ClinicDeletedListener,
    {
      provide: CLINIC_EVENT_PUBLISHER,
      useClass: ClinicEventPublisher,
    },
    {
      provide: MAIL_SERVICE,
      useClass: MailService,
    },
  ],
  exports: [CLINIC_EVENT_PUBLISHER],
})
export class ClinicEventModule {}
