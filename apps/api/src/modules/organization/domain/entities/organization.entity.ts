import { GlobalStatus, Organization as IOrganization } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { OrganizationSoftDeleteEvent } from '@modules/organization/domain/events/organization-soft-delete.event';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';

export class Organization extends AggregateRoot implements IOrganization {
  constructor(data: IOrganization) {
    super();
    this._id = data.id;
    this._name = data.name;
    this._slug = data.slug;
    this._phone = data.phone;
    this._email = data.email;
    this._address = data.address;
    this._city = data.city;
    this._district = data.district;
    this._status = data.status;
    this._timezone = data.timezone;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _name: string;
  get name(): string {
    return this._name;
  }

  private _slug: string;
  get slug(): string {
    return this._slug;
  }

  private _phone: string | null;
  get phone(): string | null {
    return this._phone;
  }

  private _email: string | null;
  get email(): string | null {
    return this._email;
  }

  private _address: string | null;
  get address(): string | null {
    return this._address;
  }

  private _city: string | null;
  get city(): string | null {
    return this._city;
  }

  private _district: string | null;
  get district(): string | null {
    return this._district;
  }

  private _status: GlobalStatus;
  get status(): GlobalStatus {
    return this._status;
  }

  private _timezone: string;
  get timezone(): string {
    return this._timezone;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _deletedAt: Date | null;
  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  public isActive(): boolean {
    return this._status === GlobalStatus.ACTIVE && this._deletedAt === null;
  }

  public isSuspended(): boolean {
    return this._status === GlobalStatus.SUSPENDED;
  }

  public isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  public softDelete(actorId: string): void {
    if (this.isDeleted()) {
      throw new Error('Organizasyon zaten silinmiş.');
    }
    this._status = GlobalStatus.DELETED;
    this._deletedAt = new Date();
    this.addDomainEvent(
      new OrganizationSoftDeleteEvent({
        organizationId: this._id,
        organizationName: this._name,
        actorId,
        action: LogAction.ORGANIZATION_SOFT_DELETE,
        type: LogType.INFO,
        details: `Organizasyon silindi: ${this._name}`,
      })
    );
  }

  public suspend(): void {
    if (!this.isActive()) {
      throw new Error('Yalnızca aktif organizasyonlar askıya alınabilir.');
    }
    this._status = GlobalStatus.SUSPENDED;
  }

  public activate(): void {
    if (this.isDeleted()) {
      throw new Error('Silinmiş organizasyon aktifleştirilemez.');
    }
    this._status = GlobalStatus.ACTIVE;
  }

  public toPersistence(): IOrganization {
    return {
      id: this._id,
      name: this._name,
      slug: this._slug,
      phone: this._phone,
      email: this._email,
      address: this._address,
      city: this._city,
      district: this._district,
      status: this._status,
      timezone: this._timezone,
      createdAt: this._createdAt,
      updatedAt: new Date(),
      deletedAt: this._deletedAt,
    };
  }
}
