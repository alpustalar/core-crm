import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetAccountLedgerResponse } from './get-account-ledger.response';

/**
 * Defter-i Kebir — bir şubedeki tek hesabın (kod ile) POSTED hareketleri,
 * tarih sırasında yürüyen bakiye ile. dateFrom verilirse öncesi açılış devri
 * olarak hesaplanır.
 */
export class GetAccountLedgerQuery implements IQuery {
  readonly __responseType!: GetAccountLedgerResponse;
  constructor(
    public readonly clinicId: string,
    public readonly accountCode: string,
    public readonly ctx: IGetContext,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date
  ) {}
}
