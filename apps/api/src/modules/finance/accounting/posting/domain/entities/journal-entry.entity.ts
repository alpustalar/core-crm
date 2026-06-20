import {
  JournalEntry as IJournalEntry,
  JournalEntryStatusSchema,
  JournalLine as IJournalLine,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { JournalLine } from './journal-line.entity';
import { JournalEntrySequence } from '@modules/finance/shared/domain/value-objects/journal-entry-sequence.vo';
import { JournalLines } from '@modules/finance/accounting/posting/domain/value-objects/journal-lines.vo';
import { BadRequestException } from '@nestjs/common';
import { JournalEntryStatusType as JournalEntryStatus } from '@input-type-schemas/JournalEntryStatusSchema';
import {
  BuildReversalDraftProps,
  CreateJournalEntryProps,
} from '@modules/finance/accounting/posting/domain/posting.contracts';

/**
 * Yevmiye fişi (aggregate root). Satırlarını (JournalLine) içinde tutar.
 * Değişmez kural: POSTED olurken borç = alacak ve toplam > 0.
 */
export class JournalEntry extends AggregateRoot {
  constructor(data: IJournalEntry, lines: JournalLine[] = []) {
    super();
    this._id = data.id;
    this._organizationId = data.organizationId;
    this._clinicId = data.clinicId;
    this._periodId = data.periodId;

    // Yevmiye sıra numarasını VO ile koruyoruz. VO en az 3 karakter ister; sıra no
    // DB'de bigint (1,2,3...) saklandığından 3 haneye sıfırla doldurulur ('001').
    this._entryNo = data.entryNo
      ? JournalEntrySequence.create(JournalEntry.formatEntryNo(data.entryNo))
      : null;
    this._entryDate = data.entryDate;

    this._description = data.description;

    this._status = data.status;
    this._eventId = data.eventId;
    this._reversedById = data.reversedById;
    this._performedById = data.performedById;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._lines = new JournalLines(lines);
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _periodId: string;
  get periodId(): string {
    return this._periodId;
  }

  private _entryNo: JournalEntrySequence | null;
  get entryNo(): JournalEntrySequence | null {
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

  private _lines: JournalLines;
  get lines(): JournalLines {
    return this._lines;
  }

  public get totalDebit() {
    return this._lines.totalDebit;
  }

  public get totalCredit() {
    return this._lines.totalCredit;
  }

  public get isBalanced(): boolean {
    return this._lines.isBalanced;
  }

  public static createDraft(props: CreateJournalEntryProps): JournalEntry {
    const id = props.id ?? crypto.randomUUID();
    const lines = props.lines.map((line) => JournalLine.create(id, line));

    const entry = new JournalEntry(
      {
        id,
        organizationId: props.organizationId,
        clinicId: props.clinicId,
        periodId: props.periodId,
        entryNo: null,
        entryDate: props.entryDate,
        description: props.description ?? null, // Saf string mapping
        status: JournalEntryStatusSchema.enum.DRAFT,
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

  /** bigint sıra no → en az 3 haneli string ('1' → '001'). VO min-3 kuralı için. */
  private static formatEntryNo(entryNo: bigint): string {
    return entryNo.toString().padStart(3, '0');
  }

  /** Denge ve yapısal aggregate invariant'larını doğrular. */
  public validateStructure(): void {
    // Koleksiyon VO'nun sunduğu metodlar ile doğrulama
    this._lines.validateBalance();

    if (this.totalDebit.lte(0)) {
      throw new BadRequestException('Fiş toplamı sıfır veya negatif olamaz.');
    }
  }

  /** Taslak fişi POSTED yapar ve yevmiye sıra numarası atar. */
  public post(entryNo: bigint): void {
    if (this._status !== JournalEntryStatusSchema.enum.DRAFT) {
      throw new BadRequestException('Yalnızca taslak fişler POST edilebilir.');
    }

    // Fişi POST etmeden önce son kez invariant kontrolü
    this.validateStructure();

    this._entryNo = JournalEntrySequence.create(
      JournalEntry.formatEntryNo(entryNo)
    );
    this._status = JournalEntryStatusSchema.enum.POSTED;
  }

  public isPosted(): boolean {
    return this._status === JournalEntryStatusSchema.enum.POSTED;
  }

  public isReversed(): boolean {
    return this._status === JournalEntryStatusSchema.enum.REVERSED;
  }

  /**
   * Bu fişin storno (ters kayıt) taslağını üretir: her satırın borç/alacağı yer
   * değiştirir. Storno yeni bir fiştir — kendi dönemine/numara akışına girer, eventId
   * taşımaz. Kilitli dönemdeki kaydı düzeltmenin tek yolu budur (doc 04, doc 08).
   */
  public buildReversalDraft(props: BuildReversalDraftProps): JournalEntry {
    this.ensureReversible();
    return JournalEntry.createDraft({
      id: props.reversalId,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      periodId: props.periodId,
      entryDate: props.entryDate,
      description:
        props.description ?? `Storno: ${this._description ?? this._id}`,
      eventId: null,
      performedById: props.performedById ?? null,
      lines: this._lines.items.map((line) => ({
        accountId: line.accountId,
        partyId: line.partyId,
        // Ters kayıt: borç ↔ alacak yer değiştirir.
        debit: line.credit,
        credit: line.debit,
        lineDesc: line.lineDesc,
      })),
    });
  }

  /** Orijinal fişi REVERSED işaretler ve onu üreten storno fişine bağlar. */
  public markReversed(reversalId: string): void {
    this.ensureReversible();
    this._status = JournalEntryStatusSchema.enum.REVERSED;
    this._reversedById = reversalId;
  }

  public toPersistence(): IJournalEntry {
    return {
      id: this._id,
      organizationId: this._organizationId,
      clinicId: this._clinicId,
      periodId: this._periodId,
      entryNo: this._entryNo ? BigInt(this._entryNo.value) : null,
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
    return this._lines.toPersistence();
  }

  private ensureReversible(): void {
    if (!this.isPosted()) {
      throw new BadRequestException(
        'Yalnızca POSTED fişler storno edilebilir.'
      );
    }
    if (this._reversedById) {
      throw new BadRequestException('Fiş zaten storno edilmiş.');
    }
  }
}
