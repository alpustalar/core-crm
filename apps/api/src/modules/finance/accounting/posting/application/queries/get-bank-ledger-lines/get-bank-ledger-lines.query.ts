import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetBankLedgerLinesResponse } from './get-bank-ledger-lines.response';

/**
 * 102 (Bankalar) defterinin bir tarih aralığındaki POSTED hareketleri.
 * Banka modülü mutabakat adaylarını bu query ile çeker (bounded context —
 * accounting repository'sine doğrudan erişmez).
 */
export class GetBankLedgerLinesQuery implements IQuery {
  readonly __responseType!: GetBankLedgerLinesResponse;

  constructor(
    public readonly payload: {
      readonly clinicId: string;
      readonly dateFrom: Date;
      readonly dateTo: Date;
      readonly ctx: IGetContext;
    }
  ) {}
}
