import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { ConsentFormTemplate } from '@modules/clinical/consent-form/domain/entities/consent-form-template.entity';

export const CONSENT_TEMPLATE_COMMAND_REPOSITORY = Symbol(
  'IConsentTemplateCommandRepository'
);

export type IConsentTemplateCommandRepository =
  IBaseCommandRepository<ConsentFormTemplate>;
