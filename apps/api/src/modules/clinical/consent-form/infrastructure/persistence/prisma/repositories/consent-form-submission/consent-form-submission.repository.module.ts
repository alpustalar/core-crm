import { Module } from '@nestjs/common';
import { CONSENT_FORM_SUBMISSION_COMMAND_REPOSITORY } from '@modules/clinical/consent-form/domain/repositories/consent-form-submission/consent-form-submission.command.repository.interface';
import { ConsentFormSubmissionCommandRepository } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/consent-form-submission/consent-form-submission.command.repository';
import { CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY } from '@modules/clinical/consent-form/domain/repositories/consent-form-submission/consent-form-submission.query.repository.interface';
import { ConsentFormSubmissionQueryRepository } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/consent-form-submission/consent-form-submission.query.repository';

@Module({
  providers: [
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
    CONSENT_FORM_SUBMISSION_COMMAND_REPOSITORY,
    CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY,
  ],
})
export class ConsentFormSubmissionRepositoryModule {}
