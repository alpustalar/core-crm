import { ConsentFormTemplate } from '@shared';
import { FindConsentTemplatesFilter } from '@modules/clinical/consent-form/domain/contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const CONSENT_TEMPLATE_QUERY_REPOSITORY = Symbol(
  'IConsentTemplateQueryRepository'
);

export interface IConsentTemplateQueryRepository {
  findById(id: string): Promise<ConsentFormTemplate | null>;
  findMany(
    filter: FindConsentTemplatesFilter
  ): Promise<Paginated<ConsentFormTemplate>>;
}
