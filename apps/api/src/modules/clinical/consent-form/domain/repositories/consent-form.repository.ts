import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { ConsentFormTemplate } from '@modules/clinical/consent-form/domain/entities/consent-form-template.entity';
import { ConsentFormSubmission } from '@modules/clinical/consent-form/domain/entities/consent-form-submission.entity';
import {
  ConsentFormSubmissionListItem,
  FindConsentSubmissionsByPatientFilter,
  FindConsentTemplatesFilter,
} from '@modules/clinical/consent-form/domain/contracts/consent-form.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const CONSENT_TEMPLATE_COMMAND_REPOSITORY = Symbol(
  'IConsentTemplateCommandRepository'
);
export const CONSENT_TEMPLATE_QUERY_REPOSITORY = Symbol(
  'IConsentTemplateQueryRepository'
);
export const CONSENT_FORM_SUBMISSION_COMMAND_REPOSITORY = Symbol(
  'IConsentFormSubmissionCommandRepository'
);
export const CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY = Symbol(
  'IConsentFormSubmissionQueryRepository'
);

export type IConsentTemplateCommandRepository =
  IBaseCommandRepository<ConsentFormTemplate>;

export interface IConsentTemplateQueryRepository {
  findById(id: string): Promise<ConsentFormTemplate | null>;
  findMany(
    filter: FindConsentTemplatesFilter
  ): Promise<Paginated<ConsentFormTemplate>>;
}

export type IConsentFormSubmissionCommandRepository =
  IBaseCommandRepository<ConsentFormSubmission>;

export interface IConsentFormSubmissionQueryRepository {
  findById(id: string): Promise<ConsentFormSubmission | null>;
  findByPatient(
    filter: FindConsentSubmissionsByPatientFilter
  ): Promise<Paginated<ConsentFormSubmissionListItem>>;
}
