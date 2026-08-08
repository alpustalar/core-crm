import { Module } from '@nestjs/common';
import { ConsentFormRepositoriesModule } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/repositories.module';
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
  imports: [ConsentFormRepositoriesModule],
  providers: CONSENT_FORM_QUERY_HANDLERS,
  exports: CONSENT_FORM_QUERY_HANDLERS,
})
export class ConsentFormQueryModule {}
