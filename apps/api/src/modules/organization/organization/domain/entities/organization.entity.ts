import {
  GlobalStatusSchema,
  GlobalStatusType as GlobalStatus,
} from '@input-type-schemas/GlobalStatusSchema';
import { Organization as IOrganization } from '@model-schema/OrganizationSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { DateTimeManager, slugIt } from '@common/utils';
import { OrganizationSoftDeleteEvent } from '@modules/organization/organization/domain/events/organization-soft-delete.event';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import {
  CreateOrganizationProps,
  UpdateOrganizationInfoProps,
} from '@modules/organization/organization/domain/contracts/organization';
import { TimeZone } from '@src/domain/value-objects/timezone.vo';
import { TimeZoneSchema } from '@shared';
import { Name } from '@src/domain/value-objects/name.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Slug } from '@src/domain/value-objects/slug.vo';
import { Phone } from '@src/domain/value-objects/phone.vo';
import { Email } from '@src/domain/value-objects/email.vo';
import { isNotUndefined } from '@common/utils/is-not-undefined';

export class Organization extends AggregateRoot {
  constructor(data: IOrganization) {
    const name = Name.fromTrusted(data.name);
    super();
    this._id = UUID.fromTrusted(data.id);
    this._name = name;
    this._slug = name.toSlug();
    this._phone = Phone.create(data.phone).instance ?? null;
    this._email = Email.create(data.email).instance ?? null;
    this._address = data.address;
    this._city = data.city;
    this._district = data.district;
    this._status = data.status;
    this._timezone = TimeZone.fromTrusted(data.timezone);
    this._isPlatform = data.isPlatform;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _name: Name;
  get name(): Name {
    return this._name;
  }

  private _slug: Slug;
  get slug(): Slug {
    return this._slug;
  }

  private _phone: Phone | null;
  get phone(): Phone | null {
    return this._phone;
  }

  private _email: Email | null;
  get email(): Email | null {
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

  private _timezone: TimeZone;
  get timezone(): TimeZone {
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

  /**
   * Platformun kendi kiracı satırı mı. Sistem satırıdır (migration ile kurulur);
   * uygulamadan açılan hiçbir organizasyon bu bayrağı alamaz.
   */
  private _isPlatform: boolean;
  get isPlatform(): boolean {
    return this._isPlatform;
  }

  public static create(props: CreateOrganizationProps): Organization {
    const now = DateTimeManager.create();

    return new Organization({
      id: UUID.createOrGenerate(props.id).value,
      name: props.name,
      slug: slugIt(props.name),
      phone: props.phone ?? null,
      email: props.email ?? null,
      address: props.address ?? null,
      city: props.city ?? null,
      district: props.district ?? null,
      status: GlobalStatusSchema.enum.ACTIVE,
      timezone: props.timezone ?? TimeZoneSchema.enum.Europe_Istanbul,
      // Uygulamadan açılan organizasyon hiçbir zaman platform değildir.
      isPlatform: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  public updateInfo(props: UpdateOrganizationInfoProps): void {
    if (isNotUndefined(props.name)) {
      const name = Name.create(props.name).orThrow();
      this._name = name;
      this._slug = name.toSlug();
    }
    if (isNotUndefined(props.phone))
      this._phone = props.phone ? Phone.create(props.phone).orThrow() : null;

    if (isNotUndefined(props.email))
      this._email = props.email ? Email.create(props.email).orThrow() : null;

    if (isNotUndefined(props.address)) this._address = props.address ?? null;
    if (isNotUndefined(props.city)) this._city = props.city ?? null;
    if (isNotUndefined(props.district)) this._district = props.district ?? null;
  }

  public isActive(): boolean {
    return (
      this._status === GlobalStatusSchema.enum.ACTIVE &&
      this._deletedAt === null
    );
  }

  public isSuspended(): boolean {
    return this._status === GlobalStatusSchema.enum.SUSPENDED;
  }

  public isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  public softDelete(actorId: string): void {
    if (this.isDeleted()) {
      throw new Error('Organizasyon zaten silinmiş.');
    }
    this._status = GlobalStatusSchema.enum.DELETED;
    this._deletedAt = DateTimeManager.create();
    this.addDomainEvent(
      new OrganizationSoftDeleteEvent({
        organizationId: this.id.value,
        organizationName: this.name.value,
        actorId,
        action: LogAction.ORGANIZATION_SOFT_DELETE,
        type: LogType.INFO,
        details: `Organizasyon silindi: ${this.name.value}`,
      })
    );
  }

  public suspend(): void {
    if (!this.isActive()) {
      throw new Error('Yalnızca aktif organizasyonlar askıya alınabilir.');
    }
    this._status = GlobalStatusSchema.enum.SUSPENDED;
  }

  public activate(): void {
    if (this.isDeleted()) {
      throw new Error('Silinmiş organizasyon aktifleştirilemez.');
    }
    this._status = GlobalStatusSchema.enum.ACTIVE;
  }

  public toPersistence(): IOrganization {
    return {
      id: this.id.value,
      name: this.name.value,
      slug: this.slug.value,
      phone: this.phone?.value ?? null,
      email: this.email?.value ?? null,
      address: this.address,
      city: this.city,
      district: this.district,
      status: this.status,
      timezone: this.timezone.value,
      isPlatform: this.isPlatform,
      createdAt: this.createdAt,
      updatedAt: DateTimeManager.create(),
      deletedAt: this.deletedAt,
    };
  }
}
