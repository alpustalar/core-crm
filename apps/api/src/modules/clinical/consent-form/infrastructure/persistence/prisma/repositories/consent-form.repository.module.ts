import { Module } from '@nestjs/common';
import { ConsentFormSubmissionRepositoryModule } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/consent-form-submission/consent-form-submission.repository.module';
import { ConsentFormTemplateRepositoryModule } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/consent-form-template/consent-form-template.repository.module';

@Module({
  imports: [
    ConsentFormSubmissionRepositoryModule,
    ConsentFormTemplateRepositoryModule,
  ],
  exports: [
    ConsentFormTemplateRepositoryModule,
    ConsentFormSubmissionRepositoryModule,
  ],
})
export class ConsentFormRepositoryModule {}
