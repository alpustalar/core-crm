import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetConsentTemplateByIdResponse } from './get-consent-template-by-id.response';

export class GetConsentTemplateByIdQuery implements IQuery {
  readonly __responseType!: GetConsentTemplateByIdResponse;
  constructor(
    public readonly templateId: string,
    public readonly ctx: IGetContext
  ) {}
}
