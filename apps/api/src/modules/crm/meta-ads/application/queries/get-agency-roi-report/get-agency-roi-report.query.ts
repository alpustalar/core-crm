import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetAgencyRoiReportResponse } from './get-agency-roi-report.response';

/**
 * Ajans ROI raporu: dönem reklam harcaması vs. o reklamlardan gelen hastaların geliri
 * (kampanya → lead → hasta → gelir zinciri) + önceki eşit dönemle karşılaştırma.
 */
export class GetAgencyRoiReportQuery implements IQuery {
  readonly __responseType!: GetAgencyRoiReportResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      from: Date;
      to: Date;
      ctx: IGetContext;
      campaignId?: string;
    }
  ) {}
}
