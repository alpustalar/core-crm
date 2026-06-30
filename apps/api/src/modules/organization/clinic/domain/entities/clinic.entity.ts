import { Clinic as IClinic, UpdateClinic } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { ClinicCreatedEvent } from '@modules/organization/clinic/domain/events/clinic-created.event';
import { ClinicSoftDeletedEvent } from '@modules/organization/clinic/domain/events/clinic-soft-deleted.event';
import { randomUUID } from 'crypto';
import {
  GlobalStatusSchema,
  GlobalStatusType as GlobalStatus,
} from '@input-type-schemas/GlobalStatusSchema';
import { CreateClinicProps } from '@modules/organization/clinic/domain/contracts/clinic.contracts';
import { Coordinates } from '@src/domain/value-objects/coordinates.vo';
import { TimeZone } from '@src/domain/value-objects/timezone.vo';
import { Slug } from '@src/domain/value-objects/slug.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Phone } from '@src/domain/value-objects/phone.vo';
import { Email } from '@src/domain/value-objects/email.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Name } from '@src/domain/value-objects/name.vo';
import { Img } from '@src/domain/value-objects/img.vo';

export class Clinic extends AggregateRoot {
  constructor(data: IClinic) {
    super();

    let coordinates: Coordinates | undefined;

    if (data.latitude && data.longitude) {
      coordinates =
        Coordinates.fromTrusted(data.latitude, data.longitude) ?? null;
    }

    this._id = UUID.fromTrusted(data.id);
    this._name = Name.fromTrusted(data.name);
    this._slug = Slug.fromTrusted(data.slug);
    this._sectorId = UUID.fromTrusted(data.sectorId);
    this._phone = data.phone ? Phone.fromTrusted(data.phone) : null;
    this._email = data.email ? Email.fromTrusted(data.email) : null;
    this._address = data.address;
    this._city = data.city;
    this._district = data.district;
    this._coordinates = coordinates ?? null;
    this._latitude = coordinates ? coordinates.latitude : null;
    this._longitude = coordinates ? coordinates.longitude : null;
    this._consultationSlotDuration = data.consultationSlotDuration;
    this._status = data.status;
    this._timezone = TimeZone.fromTrusted(data.timezone);
    this._logo = Img.fromTrusted(data.logo);
    this._organizationId = UUID.fromTrusted(data.organizationId);
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

  private _sectorId: UUID;
  get sectorId(): UUID {
    return this._sectorId;
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

  private _latitude: number | null;
  get latitude(): number | null {
    return this._coordinates?.latitude ?? null;
  }

  private _longitude: number | null;
  get longitude(): number | null {
    return this._coordinates?.longitude ?? null;
  }

  private _coordinates: Coordinates | null;
  get coordinates(): Coordinates | null {
    return this._coordinates;
  }

  private _consultationSlotDuration: number;
  get consultationSlotDuration(): number {
    return this._consultationSlotDuration;
  }

  private _status: GlobalStatus;
  get status(): GlobalStatus {
    return this._status;
  }

  private _timezone: TimeZone;
  get timezone(): TimeZone {
    return this._timezone;
  }

  private _logo: Img | null;
  get logo(): Img | null {
    return this._logo;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
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

  get isDeleted(): boolean {
    return !!this._deletedAt;
  }

  get isActive(): boolean {
    return this._status === GlobalStatusSchema.enum.ACTIVE && !this.isDeleted;
  }

  public static create(props: CreateClinicProps, actorId?: string): Clinic {
    const now = new Date();

    let coordinates: Coordinates | undefined;

    if (props.latitude || props.longitude) {
      coordinates = Coordinates.create(
        props.latitude,
        props.longitude
      ).orThrow();
    }

    const clinic = new Clinic({
      id: props.id ?? randomUUID(),
      name: props.name,
      slug: Slug.create(props.name).value,
      sectorId: props.sectorId,
      phone: props.phone ? Phone.create(props.phone).orThrow().value : null,
      email: props.email ? Email.create(props.email).orThrow().value : null,
      address: props.address ?? null,
      city: props.city ?? null,
      district: props.district ?? null,
      latitude: coordinates ? coordinates.latitude : null,
      longitude: coordinates ? coordinates.longitude : null,
      consultationSlotDuration: props.consultationSlotDuration,
      status: props.status ?? GlobalStatusSchema.enum.ACTIVE,
      timezone: TimeZone.create(props.timezone).orThrow().value,
      logo: props.logo
        ? Img.create(props.organizationId).orThrow().value
        : null,
      organizationId: UUID.create(props.organizationId).orThrow().value,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
    clinic.addDomainEvent(
      new ClinicCreatedEvent({
        clinicId: clinic._id.value,
        organizationId: clinic._organizationId.value,
        actorId,
      })
    );
    return clinic;
  }

  public canAcceptAppointments(): boolean {
    return this.isActive;
  }

  public update(data: UpdateClinic): void {
    if (data.name !== undefined) {
      const name = Name.create(data.name);
      this._name = name;
      this._slug = name.toSlug();
    }
    if (data.phone !== undefined)
      this._phone = Phone.create(data.phone).orThrow();
    if (data.email !== undefined)
      this._email = Email.create(data.email).orThrow();
    if (data.address !== undefined) this._address = data.address;
    if (data.city !== undefined) this._city = data.city;
    if (data.district !== undefined) this._district = data.district;

    const longitude = data?.longitude ?? this._longitude;
    const latitude = data?.latitude ?? this._latitude;
    if (data.latitude || data.longitude) {
      this._coordinates = Coordinates.create(latitude, longitude).orThrow();
    }

    if (data.logo) {
      this._logo = Img.create(data.logo).orThrow();
    }

    if (data.status !== undefined) this._status = data.status;
    if (data.timezone !== undefined)
      this._timezone = TimeZone.create(data.timezone).orThrow();
    if (data.organizationId !== undefined)
      this._organizationId = UUID.create(data.organizationId).orThrow();
    if (data.sectorId !== undefined)
      this._sectorId = UUID.create(data.sectorId).orThrow();
    if (data.consultationSlotDuration !== undefined)
      this._consultationSlotDuration = data.consultationSlotDuration;
    this._updatedAt = DateTimeManager.create();
  }

  public softDelete(actorId?: string): void {
    this._status = GlobalStatusSchema.enum.DELETED;
    this._deletedAt = DateTimeManager.create();
    this.addDomainEvent(
      new ClinicSoftDeletedEvent({
        clinicId: this._id.value,
        organizationId: this._organizationId.value,
        actorId,
      })
    );
  }

  toPersistence(): IClinic {
    return {
      id: this._id.value,
      name: this._name.value,
      slug: this._slug.value,
      sectorId: this._sectorId.value,
      phone: this._phone?.value ?? null,
      email: this._email?.value ?? null,
      address: this._address,
      city: this._city,
      district: this._district,
      latitude: this._latitude,
      longitude: this._longitude,
      consultationSlotDuration: this._consultationSlotDuration,
      status: this._status,
      timezone: this._timezone.value,
      logo: this._logo?.value ?? null,
      organizationId: this._organizationId?.value ?? null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}
