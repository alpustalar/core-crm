import { IQuery } from '@nestjs/cqrs';
import { Pagination } from '@shared';
import { IGetContext } from '@common/decorators';
import { GetJournalReportResponse } from './get-journal-report.response';

/**
 * Yevmiye Defteri — bir şubenin kronolojik POSTED fişleri (entryDate, entryNo
 * sırasında), her fiş satırı hesap kodu/adı ile. Sayfalanır; opsiyonel tarih
 * aralığı.
 */
export class GetJournalReportQuery implements IQuery {
  readonly __responseType!: GetJournalReportResponse;
  constructor(
    public readonly clinicId: string,
    public readonly pagination: Pagination,
    public readonly ctx: IGetContext,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date
  ) {}
}
