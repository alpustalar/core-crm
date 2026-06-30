import {
  InvalidCoordinatesFormatException,
  InvalidLatitudeException,
  InvalidLongitudeException,
} from '@src/domain/exceptions/vo/coordinates.exceptions';

export class Coordinates {
  private readonly _latitude: number;
  private readonly _longitude: number;

  private constructor(latitude: number, longitude: number) {
    this._latitude = latitude;
    this._longitude = longitude;
    Object.freeze(this);
  }

  get latitude(): number {
    return this._latitude;
  }

  get longitude(): number {
    return this._longitude;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) koordinatlardan doğrudan VO üretir; aralık doğrulaması atlanır.
   */
  public static fromTrusted(latitude: number, longitude: number): Coordinates {
    return new Coordinates(latitude, longitude);
  }

  public static create(latitude?: number | null, longitude?: number | null) {
    const isBlank =
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null;

    let instance: Coordinates | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        if (latitude < -90 || latitude > 90) {
          throw new InvalidLatitudeException(latitude);
        }
        if (longitude < -180 || longitude > 180) {
          throw new InvalidLongitudeException(longitude);
        }
        instance = new Coordinates(latitude, longitude);
      } catch (e: any) {
        error = e;
      }
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Geçersizse veya boşsa undefined döner (Akışı kesmez)
       */
      instance: error ? undefined : instance,

      /**
       * ➔ Zorunlu Senaryo: Veri eksikse veya limit dışıysa anında fırlatır
       */
      orThrow(exception?: Error): Coordinates {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidCoordinatesFormatException();
        }
        return instance;
      },
    };
  }

  /** * 🎯 Metinden koordinat çözer. Örn: "40.1885,29.0610"
   */
  public static fromString(value: string | null | undefined) {
    const isBlank = !value || value.trim().length === 0;

    if (isBlank) {
      return {
        instance: undefined,
        orThrow(exception?: Error): Coordinates {
          throw exception ?? new InvalidCoordinatesFormatException();
        },
      };
    }

    const parts = value.split(',').map((p) => parseFloat(p.trim()));

    if (parts.length !== 2 || parts.some(isNaN)) {
      const formatError = new InvalidCoordinatesFormatException(value);
      return {
        instance: undefined,
        orThrow(exception?: Error): Coordinates {
          throw exception ?? formatError;
        },
      };
    }

    // Matematiksel aralık kontrolü için ana create metoduna paslıyoruz
    return Coordinates.create(parts[0], parts[1]);
  }

  /** İki koordinatın matematiksel olarak birbirine eşit olup olmadığını söyler */
  public equals(other: Coordinates): boolean {
    return (
      this._latitude === other.latitude && this._longitude === other.longitude
    );
  }

  /**
   * İki koordinat arasındaki kuş uçuşu mesafeyi Haversine formülü ile hesaplar.
   */
  public distanceTo(other: Coordinates): number {
    const EARTH_RADIUS_METERS = 6371000;

    const dLat = this.toRadians(other.latitude - this._latitude);
    const dLon = this.toRadians(other.longitude - this._longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this._latitude)) *
        Math.cos(this.toRadians(other.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_METERS * c;
  }

  public isWithinRadius(center: Coordinates, radiusMeters: number): boolean {
    return this.distanceTo(center) <= radiusMeters;
  }

  public toString(): string {
    return `${this._latitude},${this._longitude}`;
  }

  public toJSON() {
    return {
      latitude: this._latitude,
      longitude: this._longitude,
    };
  }

  private toRadians(degree: number): number {
    return (degree * Math.PI) / 180;
  }
}
