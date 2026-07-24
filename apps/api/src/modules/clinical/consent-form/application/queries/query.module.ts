import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConsentFormRepositoryModule } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/consent-form.repository.module';
import { GetConsentTemplatesHandler } from './get-consent-templates/get-consent-templates.handler';
import { GetConsentTemplateByIdHandler } from './get-consent-template-by-id/get-consent-template-by-id.handler';
import { GetConsentSubmissionsByPatientHandler } from './get-consent-submissions-by-patient/get-consent-submissions-by-patient.handler';
import { GetConsentSubmissionByIdHandler } from './get-consent-submission-by-id/get-consent-submission-by-id.handler';

export const CONSENT_FORM_QUERY_HANDLERS = [
  GetConsentTemplatesHandler,
  GetConsentTemplateByIdHandler,
  GetConsentSubmissionsByPatientHandler,
  GetConsentSubmissionByIdHandler,
];

@Module({
  imports: [CqrsModule, ConsentFormRepositoryModule],
  providers: CONSENT_FORM_QUERY_HANDLERS,
  exports: CONSENT_FORM_QUERY_HANDLERS,
})
export class ConsentFormQueryModule {}
