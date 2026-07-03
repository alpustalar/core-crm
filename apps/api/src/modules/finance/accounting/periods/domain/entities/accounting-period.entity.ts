import {
  AccountingPeriod as IAccountingPeriod,
  AccountingPeriodStatusSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { DateTimeManager } from '@common/utils';

import { AccountingPeriodStatusType as AccountingPeriodStatus } from '@input-type-schemas/AccountingPeriodStatusSchema';
import { CreateAccountingPeriodProps } from '@modules/finance/accounting/periods/domain/periods.contracts';
import {
  InvalidPeriodLockException,
  InvalidPeriodReopenException,
  PeriodAlreadyClosedException,
} from '@modules/finance/accounting/periods/domain/exceptions/period.exceptions';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Guard } from '@common/domain/guards';

export class AccountingPeriod extends AggregateRoot {
  constructor(data: IAccountingPeriod) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._year = data.year;
    this._status = data.status;
    this._startsAt = data.startsAt;
    this._endsAt = data.endsAt;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _year: number;
  get year(): number {
    return this._year;
  }

  private _status: AccountingPeriodStatus;
  get status(): AccountingPeriodStatus {
    return this._status;
  }

  private _startsAt: Date;
  get startsAt(): Date {
    return this._startsAt;
  }

  private _endsAt: Date;
  get endsAt(): Date {
    return this._endsAt;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public get validate() {
    return {
      isOpen: this.isOpen,
      isClosed: this.isClosed,
      isLocked: this.isLocked,
      canPost: this.canPost,
      isOpenOrLocked: this.validateIsOpenOrLocked,
    };
  }

  private get canPost(): Guard<boolean> {
    const isOpen = this.isOpen.value;
    return Guard.monitor(
      isOpen,
      isOpen,
      new Error('Sadece açık döneme fiş atılabilir')
    );
  }

  private get isOpen(): Guard<boolean> {
    const isOpen = this._status === AccountingPeriodStatusSchema.enum.OPEN;
    return Guard.monitor(isOpen, isOpen, new Error('Dönem açık değil'));
  }

  private get isLocked(): Guard<boolean> {
    const isLocked = this._status === AccountingPeriodStatusSchema.enum.LOCKED;
    return Guard.monitor(isLocked, isLocked, new Error('Dönem kilitli değil.'));
  }

  private get isClosed(): Guard<boolean> {
    const isClosed = this._status === AccountingPeriodStatusSchema.enum.CLOSED;
    return Guard.monitor(isClosed, isClosed, new Error('Dönem kapalı değil.'));
  }

  private get validateIsOpenOrLocked(): Guard<boolean> {
    return Guard.monitor(
      !this.isClosed.value,
      !this.isClosed.value,
      new PeriodAlreadyClosedException(this.id.value, this.year)
    );
  }

  public static create(props: CreateAccountingPeriodProps): AccountingPeriod {
    const now = DateTimeManager.create();

    const id = props.id ? UUID.create(props.id).orThrow() : UUID.generate();

    return new AccountingPeriod({
      id: id.value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      organizationId: UUID.create(props.organizationId).orThrow().value,
      year: props.year,
      status: AccountingPeriodStatusSchema.enum.OPEN,
      startsAt: DateTimeManager.startOfYear(props.year),
      endsAt: DateTimeManager.endOfYear(props.year),
      createdAt: now,
      updatedAt: now,
    });
  }

  public lock(): void {
    if (!this.isOpen.value) {
      throw new InvalidPeriodLockException();
    }
    this._status = AccountingPeriodStatusSchema.enum.LOCKED;
  }

  public reopen(): void {
    if (!this.isLocked.value) {
      throw new InvalidPeriodReopenException();
    }
    this._status = AccountingPeriodStatusSchema.enum.OPEN;
  }

  public close(): void {
    if (this.isClosed.value) {
      throw new PeriodAlreadyClosedException(this.id.value, this.year);
    }
    this._status = AccountingPeriodStatusSchema.enum.CLOSED;
  }

  public toPersistence(): IAccountingPeriod {
    return {
      id: this._id.value,
      clinicId: this._clinicId.value,
      organizationId: this._organizationId.value,
      year: this._year,
      status: this._status,
      startsAt: this._startsAt,
      endsAt: this._endsAt,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
