import {
  Clinic as PrismaClinic,
  GlobalStatus,
  Organization,
  Sector,
} from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { ClinicCreatedEvent } from '@modules/organization/clinic/domain/events/clinic-created.event';
import { ClinicSoftDeletedEvent } from '@modules/organization/clinic/domain/events/clinic-soft-deleted.event';
import { CreateClinicProps } from '@modules/organization/clinic/domain/types/create-clinic.props';
import { slugIt } from '@common/utils';
import { randomUUID } from 'crypto';
import { UpdateClinic } from '@shared';

export class Clinic extends AggregateRoot implements PrismaClinic {
  constructor(data: PrismaClinic) {
    super();
    this._id = data.id;
    this._name = data.name;
    this._slug = data.slug;
    this._sectorId = data.sectorId;
    this._phone = data.phone;
    this._email = data.email;
    this._address = data.address;
    this._city = data.city;
    this._district = data.district;
    this._consultationSlotDuration = data.consultationSlotDuration;
    this._status = data.status;
    this._timezone = data.timezone;
    this._logo = data.logo;
    this._organizationId = data.organizationId;
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

  private _sectorId: string;
  get sectorId(): string {
    return this._sectorId;
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

  private _consultationSlotDuration: number;
  get consultationSlotDuration(): number {
    return this._consultationSlotDuration;
  }

  private _status: GlobalStatus;
  get status(): GlobalStatus {
    return this._status;
  }

  private _timezone: string;
  get timezone(): string {
    return this._timezone;
  }

  private _logo: string | null;
  get logo(): string | null {
    return this._logo;
  }

  private _organizationId: string;
  get organizationId(): string {
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

  private _sector: Sector | null;
  get sector(): Sector | null {
    return this._sector;
  }

  private _organization: Organization | null;
  get organization(): Organization | null {
    return this._organization;
  }

  get isDeleted(): boolean {
    return !!this._deletedAt;
  }

  get isActive(): boolean {
    return this._status === GlobalStatus.ACTIVE && !this.isDeleted;
  }

  public canAcceptAppointments(): boolean {
    return this.isActive;
  }

  public static create(props: CreateClinicProps, actorId?: string): Clinic {
    const now = new Date();
    const clinic = new Clinic({
      id: props.id ?? randomUUID(),
      name: props.name,
      slug: slugIt(props.name),
      sectorId: props.sectorId,
      phone: props.phone ?? null,
      email: props.email ?? null,
      address: props.address ?? null,
      city: props.city ?? null,
      district: props.district ?? null,
      consultationSlotDuration: props.consultationSlotDuration,
      status: props.status ?? GlobalStatus.ACTIVE,
      timezone: props.timezone ?? 'Europe/Istanbul',
      logo: null,
      organizationId: props.organizationId!,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
    clinic.addDomainEvent(
      new ClinicCreatedEvent({
        clinicId: clinic._id,
        organizationId: clinic._organizationId,
        actorId,
      })
    );
    return clinic;
  }

  public update(data: UpdateClinic): void {
    if (data.name !== undefined) {
      this._name = data.name;
      this._slug = slugIt(data.name);
    }
    if (data.phone !== undefined) this._phone = data.phone;
    if (data.email !== undefined) this._email = data.email;
    if (data.address !== undefined) this._address = data.address;
    if (data.city !== undefined) this._city = data.city;
    if (data.district !== undefined) this._district = data.district;
    if (data.status !== undefined) this._status = data.status;
    if (data.timezone !== undefined) this._timezone = data.timezone;
    if (data.organizationId !== undefined) this._organizationId = data.organizationId;
    if (data.sectorId !== undefined) this._sectorId = data.sectorId;
    if (data.consultationSlotDuration !== undefined)
      this._consultationSlotDuration = data.consultationSlotDuration;
    this._updatedAt = new Date();
  }

  public softDelete(actorId?: string): void {
    this._status = GlobalStatus.DELETED;
    this._deletedAt = new Date();
    this.addDomainEvent(
      new ClinicSoftDeletedEvent({
        clinicId: this._id,
        organizationId: this._organizationId,
        actorId,
      }),
    );
  }

  toPersistence(): PrismaClinic {
    return {
      id: this._id,
      name: this._name,
      slug: this._slug,
      sectorId: this._sectorId,
      phone: this._phone,
      email: this._email,
      address: this._address,
      city: this._city,
      district: this._district,
      consultationSlotDuration: this._consultationSlotDuration,
      status: this._status,
      timezone: this._timezone,
      logo: this._logo,
      organizationId: this._organizationId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}
