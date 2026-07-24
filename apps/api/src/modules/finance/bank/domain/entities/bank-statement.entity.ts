import { Decimal } from 'decimal.js';
import { BankStatement as IBankStatement } from '@model-schema/BankStatementSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { ImportBankStatementProps } from '@modules/finance/bank/domain/contracts/bank.contracts';
import { BankStatementLine } from '@modules/finance/bank/domain/entities/bank-statement-line.entity';
import { BankStatementEmptyLinesException } from '@modules/finance/bank/domain/exceptions/bank.exceptions';
import { isDefined, isEmpty } from '@common/utils';
import { DateRange } from '@src/domain/value-objects';

/**
 * Banka Ekstresi (aggregate root). Bir import batch'i: dönem + hareket satırları.
 * Satırlar UNMATCHED olarak doğar; mutabakat satır bazında (BankStatementLine) yürür.
 */
export class BankStatement extends AggregateRoot {
  constructor(data: IBankStatement, lines: BankStatementLine[]) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._bankAccountId = UUID.fromTrusted(data.bankAccountId);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._organizationId = UUID.fromTrusted(data.organizationId);

    this._periodDateRange = DateRange.fromTrusted(
      data.periodStart,
      data.periodEnd
    );

    this._openingBalance = data.openingBalance
      ? new Decimal(data.openingBalance.toString())
      : null;
    this._closingBalance = data.closingBalance
      ? new Decimal(data.closingBalance.toString())
      : null;
    this._fileName = data.fileName;
    this._importedById = data.importedById;
    this._createdAt = data.createdAt;
    this._lines = lines;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _bankAccountId: UUID;
  get bankAccountId(): UUID {
    return this._bankAccountId;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _periodDateRange: DateRange;
  get periodDateRange(): DateRange {
    return this._periodDateRange;
  }

  get periodStart(): Date {
    return this.periodDateRange.startDate;
  }

  get periodEnd(): Date {
    return this.periodDateRange.endDate;
  }

  private _openingBalance: Decimal | null;
  get openingBalance(): Decimal | null {
    return this._openingBalance;
  }

  private _closingBalance: Decimal | null;
  get closingBalance(): Decimal | null {
    return this._closingBalance;
  }

  private _fileName: string | null;
  get fileName(): string | null {
    return this._fileName;
  }

  private _importedById: string;
  get importedById(): string {
    return this._importedById;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _lines: BankStatementLine[];
  get lines(): BankStatementLine[] {
    return this._lines;
  }

  public static create(props: ImportBankStatementProps): BankStatement {
    if (isEmpty(props.lines)) {
      throw new BankStatementEmptyLinesException();
    }

    const now = DateTimeManager.create();
    const statementId = UUID.createOrGenerate(props.id).value;

    const lines = props.lines.map((line) =>
      BankStatementLine.createForImport({
        bankStatementId: statementId,
        bankAccountId: props.bankAccountId,
        clinicId: props.clinicId,
        organizationId: props.organizationId,
        transactionDate: line.transactionDate,
        description: line.description,
        amount: line.amount,
        balanceAfter: line.balanceAfter,
        reference: line.reference,
        counterpartyName: line.counterpartyName,
      })
    );

    return new BankStatement(
      {
        id: statementId,
        bankAccountId: UUID.create(props.bankAccountId).orThrow().value,
        clinicId: UUID.create(props.clinicId).orThrow().value,
        organizationId: UUID.create(props.organizationId).orThrow().value,
        periodStart: props.periodStart,
        periodEnd: props.periodEnd,
        openingBalance: isDefined(props.openingBalance)
          ? new Decimal(props.openingBalance)
          : null,
        closingBalance: isDefined(props.closingBalance)
          ? new Decimal(props.closingBalance)
          : null,
        fileName: props.fileName ?? null,
        importedById: UUID.create(props.importedById).orThrow().value,
        createdAt: now,
      },
      lines
    );
  }

  public toPersistence(): IBankStatement {
    return {
      id: this.id.value,
      bankAccountId: this.bankAccountId.value,
      clinicId: this.clinicId.value,
      organizationId: this.organizationId.value,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      openingBalance: this.openingBalance,
      closingBalance: this.closingBalance,
      fileName: this.fileName,
      importedById: this.importedById,
      createdAt: this.createdAt,
    };
  }
}
