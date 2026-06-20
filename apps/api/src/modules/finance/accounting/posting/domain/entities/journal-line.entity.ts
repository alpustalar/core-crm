import { JournalLine as IJournalLine } from '@shared';
import { JournalEntryLineAmount } from '@modules/finance/shared/domain/value-objects/journal-entry-line-amount.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { Decimal } from 'decimal.js';
import { CreateJournalEntryLineProps } from '@modules/finance/accounting/posting/domain/posting.contracts';

export class JournalLine {
  private readonly _amount: JournalEntryLineAmount;

  constructor(data: IJournalLine) {
    this._id = data.id;
    this._entryId = data.entryId;
    this._accountId = data.accountId;
    this._partyId = data.partyId;

    this._amount = JournalEntryLineAmount.create(
      data.debit,
      data.credit,
      Currency.create(data.currency)
    );

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

  get debit(): Decimal {
    return this._amount.debit;
  }

  get credit(): Decimal {
    return this._amount.credit;
  }

  // Para birimi tek kaynak: JournalEntryLineAmount VO. Ayrı _currency alanı tutulmaz
  // (constructor'da set edilmediği için undefined kalıyordu → save'de patlıyordu).
  get currency(): Currency {
    return this._amount.currency;
  }

  private _lineDesc: string | null;

  get lineDesc(): string | null {
    return this._lineDesc;
  }

  public static create(
    entryId: string,
    props: CreateJournalEntryLineProps
  ): JournalLine {
    // hatalı giriş (negatif sayı, XOR ihlali vb.) anında exception fırlatır.
    const amount = JournalEntryLineAmount.create(
      new Decimal(props.debit ?? 0),
      new Decimal(props.credit ?? 0),
      props.currency ? Currency.create(props.currency) : Currency.create('TRY')
    );

    return new JournalLine({
      id: crypto.randomUUID(),
      entryId,
      accountId: props.accountId,
      partyId: props.partyId ?? null,
      debit: amount.debit,
      credit: amount.credit,
      currency: amount.currency.value ?? 'TRY',
      lineDesc: props.lineDesc ?? null,
    });
  }

  public matchesAccount(accountId: string): boolean {
    return this._accountId === accountId;
  }

  public isDebit(): boolean {
    return this._amount.debit.gt(0);
  }

  public isCredit(): boolean {
    return this._amount.credit.gt(0);
  }

  public toPersistence(): IJournalLine {
    return {
      id: this._id,
      entryId: this._entryId,
      accountId: this._accountId,
      partyId: this._partyId,
      debit: this._amount.debit,
      credit: this._amount.credit,
      currency: this._amount.currency.value,
      lineDesc: this._lineDesc,
    };
  }
}
