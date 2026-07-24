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
    public readonly payload: {
      clinicId: string;
      pagination: Pagination;
      ctx: IGetContext;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {}
}
