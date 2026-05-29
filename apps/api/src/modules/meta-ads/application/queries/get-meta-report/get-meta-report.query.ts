import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetMetaReportResponse } from './get-meta-report.response';

export class GetMetaReportQuery implements IQuery {
  readonly __responseType!: GetMetaReportResponse;
  constructor(
    public readonly clinicId: string,
    public readonly from: Date,
    public readonly to: Date,
    public readonly ctx: IGetContext,
    public readonly campaignId?: string,
  ) {}
}
