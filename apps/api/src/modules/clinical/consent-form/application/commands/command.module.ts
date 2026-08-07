import { Module } from '@nestjs/common';
import { CreateConsentTemplateHandler } from './create-consent-template/create-consent-template.handler';
import { UpdateConsentTemplateHandler } from './update-consent-template/update-consent-template.handler';
import { ArchiveConsentTemplateHandler } from './archive-consent-template/archive-consent-template.handler';
import { SignConsentFormHandler } from './sign-consent-form/sign-consent-form.handler';
import { ConsentFormInfrastructureModule } from '@modules/clinical/consent-form/infrastructure/infrastructure.module';

export const CONSENT_FORM_COMMAND_HANDLERS = [
  CreateConsentTemplateHandler,
  UpdateConsentTemplateHandler,
  ArchiveConsentTemplateHandler,
  SignConsentFormHandler,
];

@Module({
  imports: [ConsentFormInfrastructureModule],
  providers: CONSENT_FORM_COMMAND_HANDLERS,
  exports: CONSENT_FORM_COMMAND_HANDLERS,
})
export class ConsentFormCommandModule {}
