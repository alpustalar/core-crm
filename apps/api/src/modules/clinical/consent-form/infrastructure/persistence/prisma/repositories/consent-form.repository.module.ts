import { Module } from '@nestjs/common';
import {
  CONSENT_FORM_SUBMISSION_COMMAND_REPOSITORY,
  CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY,
  CONSENT_TEMPLATE_COMMAND_REPOSITORY,
  CONSENT_TEMPLATE_QUERY_REPOSITORY,
} from '@modules/clinical/consent-form/domain/repositories/consent-form.repository';
import { ConsentFormTemplateCommandRepository } from './consent-form-template.command.repository';
import { ConsentFormTemplateQueryRepository } from './consent-form-template.query.repository';
import { ConsentFormSubmissionCommandRepository } from './consent-form-submission.command.repository';
import { ConsentFormSubmissionQueryRepository } from './consent-form-submission.query.repository';

@Module({
  providers: [
    {
      provide: CONSENT_TEMPLATE_COMMAND_REPOSITORY,
      useClass: ConsentFormTemplateCommandRepository,
    },
    {
      provide: CONSENT_TEMPLATE_QUERY_REPOSITORY,
      useClass: ConsentFormTemplateQueryRepository,
    },
    {
      provide: CONSENT_FORM_SUBMISSION_COMMAND_REPOSITORY,
      useClass: ConsentFormSubmissionCommandRepository,
    },
    {
      provide: CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY,
      useClass: ConsentFormSubmissionQueryRepository,
    },
  ],
  exports: [
    CONSENT_TEMPLATE_COMMAND_REPOSITORY,
    CONSENT_TEMPLATE_QUERY_REPOSITORY,
    CONSENT_FORM_SUBMISSION_COMMAND_REPOSITORY,
    CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY,
  ],
})
export class ConsentFormRepositoryModule {}
