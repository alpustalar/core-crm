import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class GetMetaReportQuery implements IQuery {
  constructor(
    public readonly clinicId: string,
    public readonly from: Date,
    public readonly to: Date,
    public readonly ctx: IGetContext,
    public readonly campaignId?: string,
  ) {}
}
