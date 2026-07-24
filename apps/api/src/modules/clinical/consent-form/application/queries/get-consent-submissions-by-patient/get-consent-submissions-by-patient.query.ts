import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetConsentSubmissionsByPatientResponse } from './get-consent-submissions-by-patient.response';

export class GetConsentSubmissionsByPatientQuery implements IQuery {
  readonly __responseType!: GetConsentSubmissionsByPatientResponse;
  constructor(
    public readonly payload: {
      readonly patientId: string;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
