import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetConsentSubmissionByIdResponse } from './get-consent-submission-by-id.response';

export class GetConsentSubmissionByIdQuery implements IQuery {
  readonly __responseType!: GetConsentSubmissionByIdResponse;
  constructor(
    public readonly submissionId: string,
    public readonly ctx: IGetContext
  ) {}
}
