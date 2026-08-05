import { Module } from '@nestjs/common';
import { CONSENT_TEMPLATE_COMMAND_REPOSITORY } from '@modules/clinical/consent-form/domain/repositories/consent-template/consent-template.command.repository';
import { CONSENT_TEMPLATE_QUERY_REPOSITORY } from '@modules/clinical/consent-form/domain/repositories/consent-template/consent-template.query.repository';
import { ConsentFormTemplateCommandRepository } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/consent-form-template/consent-form-template.command.repository';
import { ConsentFormTemplateQueryRepository } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/consent-form-template/consent-form-template.query.repository';

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
  ],
  exports: [
    CONSENT_TEMPLATE_COMMAND_REPOSITORY,
    CONSENT_TEMPLATE_QUERY_REPOSITORY,
  ],
})
export class ConsentFormTemplateRepositoryModule {}
