import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetActivitiesByLeadResponse } from './get-activities-by-lead.response';

export class GetActivitiesByLeadQuery implements IQuery {
  readonly __responseType!: GetActivitiesByLeadResponse;
  constructor(
    public readonly payload: {
      readonly leadId: string;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
      readonly clinicId: string;
    }
  ) {}
}
