import {
  JournalEntry as IJournalEntry,
  JournalLine as IJournalLine,
  JournalEntryStatus,
  Prisma,
} from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreateJournalEntryProps } from '../types/create-journal-entry.props';
import { JournalLine } from './journal-line.entity';

/**
 * Yevmiye fişi (aggregate root). Satırlarını (JournalLine) içinde tutar.
 * Değişmez kural: POSTED olurken Σborç = Σalacak (denge) ve toplam > 0.
 */
export class JournalEntry extends AggregateRoot implements IJournalEntry {
  constructor(data: IJournalEntry, lines: JournalLine[] = []) {
    super();
    this._id = data.id;
    this._organizationId = data.organizationId;
    this._clinicId = data.clinicId;
    this._periodId = data.periodId;
    this._entryNo = data.entryNo;
    this._entryDate = data.entryDate;
    this._description = data.description;
    this._status = data.status;
    this._eventId = data.eventId;
    this._reversedById = data.reversedById;
    this._performedById = data.performedById;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._lines = lines;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _clinicId: string | null;
  get clinicId(): string | null {
    return this._clinicId;
  }

  private _periodId: string;
  get periodId(): string {
    return this._periodId;
  }

  private _entryNo: bigint | null;
  get entryNo(): bigint | null {
    return this._entryNo;
  }

  private _entryDate: Date;
  get entryDate(): Date {
    return this._entryDate;
  }

  private _description: string | null;
  get description(): string | null {
    return this._description;
  }

  private _status: JournalEntryStatus;
  get status(): JournalEntryStatus {
    return this._status;
  }

  private _eventId: string | null;
  get eventId(): string | null {
    return this._eventId;
  }

  private _reversedById: string | null;
  get reversedById(): string | null {
    return this._reversedById;
  }

  private _performedById: string | null;
  get performedById(): string | null {
    return this._performedById;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _lines: JournalLine[];
  get lines(): JournalLine[] {
    return this._lines;
  }

  public static createDraft(props: CreateJournalEntryProps): JournalEntry {
    const id = props.id ?? crypto.randomUUID();
    const lines = props.lines.map((line) => JournalLine.create(id, line));

    const entry = new JournalEntry(
      {
        id,
        organizationId: props.organizationId,
        clinicId: props.clinicId ?? null,
        periodId: props.periodId,
        entryNo: null,
        entryDate: props.entryDate,
        description: props.description ?? null,
        status: JournalEntryStatus.DRAFT,
        eventId: props.eventId ?? null,
        reversedById: null,
        performedById: props.performedById ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      lines
    );

    entry.validateStructure();
    return entry;
  }

  public totalDebit(): Prisma.Decimal {
    return this._lines.reduce(
      (acc, line) => acc.plus(line.debit),
      new Prisma.Decimal(0)
    );
  }

  public totalCredit(): Prisma.Decimal {
    return this._lines.reduce(
      (acc, line) => acc.plus(line.credit),
      new Prisma.Decimal(0)
    );
  }

  public isBalanced(): boolean {
    return this.totalDebit().equals(this.totalCredit());
  }

  /** Denge, satır borç/alacak XOR ve pozitiflik kurallarını doğrular. */
  public validateStructure(): void {
    if (this._lines.length < 2) {
      throw new Error('Fiş en az iki satır içermelidir.');
    }

    for (const line of this._lines) {
      if (line.debit.lt(0) || line.credit.lt(0)) {
        throw new Error('Fiş satırı negatif tutar içeremez.');
      }
      if (line.debit.gt(0) && line.credit.gt(0)) {
        throw new Error('Bir fiş satırı hem borç hem alacak olamaz.');
      }
      if (line.debit.isZero() && line.credit.isZero()) {
        throw new Error('Fiş satırı borç veya alacak tutarı içermelidir.');
      }
    }

    if (this.totalDebit().lte(0)) {
      throw new Error('Fiş toplamı sıfır olamaz.');
    }
    if (!this.isBalanced()) {
      throw new Error(
        `Fiş dengesiz: borç=${this.totalDebit()} alacak=${this.totalCredit()}.`
      );
    }
  }

  /** Taslak fişi POSTED yapar ve fiş numarası atar. */
  public post(entryNo: bigint): void {
    if (this._status !== JournalEntryStatus.DRAFT) {
      throw new Error('Yalnızca taslak (DRAFT) fişler POST edilebilir.');
    }
    this.validateStructure();
    this._status = JournalEntryStatus.POSTED;
    this._entryNo = entryNo;
  }

  public isPosted(): boolean {
    return this._status === JournalEntryStatus.POSTED;
  }

  public toPersistence(): IJournalEntry {
    return {
      id: this._id,
      organizationId: this._organizationId,
      clinicId: this._clinicId,
      periodId: this._periodId,
      entryNo: this._entryNo,
      entryDate: this._entryDate,
      description: this._description,
      status: this._status,
      eventId: this._eventId,
      reversedById: this._reversedById,
      performedById: this._performedById,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }

  public linesToPersistence(): IJournalLine[] {
    return this._lines.map((line) => line.toPersistence());
  }
}
