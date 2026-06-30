import { HotelbedsHotel as IHotelbedsHotel } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';
import { Coordinates } from '@src/domain/value-objects/coordinates.vo';
import { CreateHotelbedsHotelProps } from '@modules/crm/health-tourism/hotel/domain/contracts/hotelbeds-hotel.contracts';

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

    // 🚀 Constructor içinde ham veriden VO üretiyoruz (Gözden kaçan atama eklendi)
    this._coordinates =
      Coordinates.create(data.latitude, data.longitude).instance ?? null;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Private Properties & Getters
  // ────────────────────────────────────────────────────────────────────────────
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
    return this._coordinates?.longitude ?? null;
  }

  private _longitude: number | null;
  get longitude(): number | null {
    return this._coordinates?.longitude ?? null;
  }

  // 🚀 Zenginleştirilmiş İş Kuralları İçin VO Getteri
  private _coordinates: Coordinates | null;
  get coordinates(): Coordinates | null {
    return this._coordinates;
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

  // ────────────────────────────────────────────────────────────────────────────
  //  Static Create Method (Factory)
  // ────────────────────────────────────────────────────────────────────────────
  public static create(props: CreateHotelbedsHotelProps): HotelbedsHotel {
    const coordinates = Coordinates.create(
      props.latitude,
      props.longitude
    ).instance;

    return new HotelbedsHotel({
      id: props.id ?? crypto.randomUUID(),
      name: props.name,
      categoryCode: props.categoryCode,
      categoryName: props.categoryName ?? null,
      destinationCode: props.destinationCode,
      destinationName: props.destinationName ?? null,
      address: props.address ?? null,
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
      images: props.images ?? null,
      phones: props.phones ?? null,
      lastSyncedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 🎯 Domain Davranışları (Zengin İş Kuralları)
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Otelin verilen başka bir lokasyona (Örn: Havalimanı veya merkeze) olan mesafesini metre cinsinden söyler.
   */
  public distanceTo(target: Coordinates): number | null {
    if (!this._coordinates) return null;
    return this._coordinates.distanceTo(target);
  }

  /**
   * Otel koordinatlarını manuel veya senkronizasyon esnasında günceller.
   */
  public updateCoordinates(coordinates: Coordinates): void {
    this._coordinates = coordinates;
    this._updatedAt = new Date();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Mapping to Persistence
  // ────────────────────────────────────────────────────────────────────────────
  public toPersistence(): IHotelbedsHotel {
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
