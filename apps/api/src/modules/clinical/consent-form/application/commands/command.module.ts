import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConsentFormEventModule } from '@modules/clinical/consent-form/infrastructure/events/consent-form-event.module';
import { CreateConsentTemplateHandler } from './create-consent-template/create-consent-template.handler';
import { UpdateConsentTemplateHandler } from './update-consent-template/update-consent-template.handler';
import { ArchiveConsentTemplateHandler } from './archive-consent-template/archive-consent-template.handler';
import { SignConsentFormHandler } from './sign-consent-form/sign-consent-form.handler';
import { ConsentFormRepositoryModule } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/consent-form.repository.module';

export const CONSENT_FORM_COMMAND_HANDLERS = [
  CreateConsentTemplateHandler,
  UpdateConsentTemplateHandler,
  ArchiveConsentTemplateHandler,
  SignConsentFormHandler,
];

@Module({
  imports: [CqrsModule, ConsentFormRepositoryModule, ConsentFormEventModule],
  providers: CONSENT_FORM_COMMAND_HANDLERS,
  exports: CONSENT_FORM_COMMAND_HANDLERS,
})
export class ConsentFormCommandModule {}
