import {
  AccountingPeriod as IAccountingPeriod,
  AccountingPeriodStatusSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { DateTimeManager } from '@common/utils';

import { AccountingPeriodStatusType as AccountingPeriodStatus } from '@input-type-schemas/AccountingPeriodStatusSchema';
import { CreateAccountingPeriodProps } from '@modules/finance/accounting/periods/domain/periods.contracts';

export class AccountingPeriod
  extends AggregateRoot
  implements IAccountingPeriod
{
  constructor(data: IAccountingPeriod) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._year = data.year;
    this._status = data.status;
    this._startsAt = data.startsAt;
    this._endsAt = data.endsAt;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _organizationId: string;
  get organizationId(): string {
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

  public static create(props: CreateAccountingPeriodProps): AccountingPeriod {
    return new AccountingPeriod({
      id: props.id ?? crypto.randomUUID(),
      clinicId: props.clinicId,
      organizationId: props.organizationId,
      year: props.year,
      status: AccountingPeriodStatusSchema.enum.OPEN,
      startsAt: DateTimeManager.startOfYear(props.year),
      endsAt: DateTimeManager.endOfYear(props.year),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public isOpen(): boolean {
    return this._status === AccountingPeriodStatusSchema.enum.OPEN;
  }

  public isLocked(): boolean {
    return this._status === AccountingPeriodStatusSchema.enum.LOCKED;
  }

  public isClosed(): boolean {
    return this._status === AccountingPeriodStatusSchema.enum.CLOSED;
  }

  /** Sadece OPEN döneme fiş atılabilir. */
  public canPost(): boolean {
    return this.isOpen();
  }

  public lock(): void {
    if (!this.isOpen()) {
      throw new Error('Yalnızca açık dönemler kilitlenebilir.');
    }
    this._status = AccountingPeriodStatusSchema.enum.LOCKED;
  }

  public reopen(): void {
    if (!this.isLocked()) {
      throw new Error('Yalnızca kilitli dönemler yeniden açılabilir.');
    }
    this._status = AccountingPeriodStatusSchema.enum.OPEN;
  }

  public close(): void {
    if (this.isClosed()) {
      throw new Error('Dönem zaten kapatılmış.');
    }
    this._status = AccountingPeriodStatusSchema.enum.CLOSED;
  }

  public toPersistence(): IAccountingPeriod {
    return {
      id: this._id,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      year: this._year,
      status: this._status,
      startsAt: this._startsAt,
      endsAt: this._endsAt,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
