import { Module } from '@nestjs/common';
import { AuditLogModule } from '@modules/platform/audit-log/audit-log.module';
import { ContextModule } from '@src/infrastructure/context/context.module';
import { CONSENT_FORM_EVENT_PUBLISHER } from '@modules/clinical/consent-form/domain/interfaces/consent-form-event-publisher.interface';
import { ConsentFormEventPublisher } from './consent-form-event-publisher.service';
import {
  ConsentTemplateArchivedListener,
  ConsentTemplateCreatedListener,
  ConsentTemplateUpdatedListener,
} from './listeners';

export const CONSENT_FORM_LISTENERS = [
  ConsentTemplateCreatedListener,
  ConsentTemplateUpdatedListener,
  ConsentTemplateArchivedListener,
];

@Module({
  imports: [AuditLogModule, ContextModule],
  providers: [
    {
      provide: CONSENT_FORM_EVENT_PUBLISHER,
      useClass: ConsentFormEventPublisher,
    },
    ...CONSENT_FORM_LISTENERS,
  ],
  exports: [CONSENT_FORM_EVENT_PUBLISHER],
})
export class ConsentFormEventModule {}
