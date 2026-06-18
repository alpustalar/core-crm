/* eslint-disable */
import { HotelbedsHotel as IHotelbedsHotel } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';

export class HotelbedsHotel extends AggregateRoot implements IHotelbedsHotel {
  constructor(data: IHotelbedsHotel) {
    super();
    this._id = data.id;
    this._name = data.name;
    this._categoryCode = data.categoryCode;
    this._categoryName = data.categoryName;
    this._destinationCode = data.destinationCode;
    this._destinationName = data.destinationName;
    this._address = data.address;
    this._latitude = data.latitude;
    this._longitude = data.longitude;
    this._images = data.images;
    this._phones = data.phones;
    this._lastSyncedAt = data.lastSyncedAt;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _name: string;
  get name(): string {
    return this._name;
  }

  private _categoryCode: string;
  get categoryCode(): string {
    return this._categoryCode;
  }

  private _categoryName: string | null;
  get categoryName(): string | null {
    return this._categoryName;
  }

  private _destinationCode: string;
  get destinationCode(): string {
    return this._destinationCode;
  }

  private _destinationName: string | null;
  get destinationName(): string | null {
    return this._destinationName;
  }

  private _address: string | null;
  get address(): string | null {
    return this._address;
  }

  private _latitude: number | null;
  get latitude(): number | null {
    return this._latitude;
  }

  private _longitude: number | null;
  get longitude(): number | null {
    return this._longitude;
  }

  private _images: JsonValue | null;
  get images(): JsonValue | null {
    return this._images;
  }

  private _phones: JsonValue | null;
  get phones(): JsonValue | null {
    return this._phones;
  }

  private _lastSyncedAt: Date;
  get lastSyncedAt(): Date {
    return this._lastSyncedAt;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  toPersistence(): IHotelbedsHotel {
    return {
      id: this._id,
      name: this._name,
      categoryCode: this._categoryCode,
      categoryName: this._categoryName,
      destinationCode: this._destinationCode,
      destinationName: this._destinationName,
      address: this._address,
      latitude: this._latitude,
      longitude: this._longitude,
      images: this._images ?? null,
      phones: this._phones ?? null,
      lastSyncedAt: this._lastSyncedAt,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
