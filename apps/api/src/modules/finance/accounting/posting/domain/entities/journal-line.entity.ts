import { JournalLine as IJournalLine, Prisma } from '@prisma/client';
import { CreateJournalEntryLineInput } from '../types/create-journal-entry.props';

export class JournalLine implements IJournalLine {
  constructor(data: IJournalLine) {
    this._id = data.id;
    this._entryId = data.entryId;
    this._accountId = data.accountId;
    this._partyId = data.partyId;
    this._debit = data.debit;
    this._credit = data.credit;
    this._currency = data.currency;
    this._lineDesc = data.lineDesc;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _entryId: string;
  get entryId(): string {
    return this._entryId;
  }

  private _accountId: string;
  get accountId(): string {
    return this._accountId;
  }

  private _partyId: string | null;
  get partyId(): string | null {
    return this._partyId;
  }

  private _debit: Prisma.Decimal;
  get debit(): Prisma.Decimal {
    return this._debit;
  }

  private _credit: Prisma.Decimal;
  get credit(): Prisma.Decimal {
    return this._credit;
  }

  private _currency: string;
  get currency(): string {
    return this._currency;
  }

  private _lineDesc: string | null;
  get lineDesc(): string | null {
    return this._lineDesc;
  }

  public static create(
    entryId: string,
    input: CreateJournalEntryLineInput
  ): JournalLine {
    return new JournalLine({
      id: crypto.randomUUID(),
      entryId,
      accountId: input.accountId,
      partyId: input.partyId ?? null,
      debit: new Prisma.Decimal(input.debit ?? 0),
      credit: new Prisma.Decimal(input.credit ?? 0),
      currency: input.currency ?? 'TRY',
      lineDesc: input.lineDesc ?? null,
    });
  }

  public isDebit(): boolean {
    return this._debit.gt(0);
  }

  public isCredit(): boolean {
    return this._credit.gt(0);
  }

  public toPersistence(): IJournalLine {
    return {
      id: this._id,
      entryId: this._entryId,
      accountId: this._accountId,
      partyId: this._partyId,
      debit: this._debit,
      credit: this._credit,
      currency: this._currency,
      lineDesc: this._lineDesc,
    };
  }
}
