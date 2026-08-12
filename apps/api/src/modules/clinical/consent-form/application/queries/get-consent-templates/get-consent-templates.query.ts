import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetConsentTemplatesResponse } from './get-consent-templates.response';
import type { GetConsentTemplatesFilter } from '@shared/modules/consent-form/types/queries';

export class GetConsentTemplatesQuery implements IQuery {
  readonly __responseType!: GetConsentTemplatesResponse;
  constructor(
    public readonly payload: {
      readonly filter: GetConsentTemplatesFilter;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
