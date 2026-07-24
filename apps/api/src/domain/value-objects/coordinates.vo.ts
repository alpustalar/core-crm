import { Guard } from '@common/domain/guards';
import { isDefined } from '@common/utils';
import { z } from 'zod';
import { InvalidCoordinatesFormatException } from '@src/domain/exceptions';

export class Coordinates {
  private static readonly schema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  });
  private readonly _latitude: number;
  private readonly _longitude: number;

  private constructor(latitude: number, longitude: number) {
    this._latitude = latitude;
    this._longitude = longitude;
    Object.freeze(this);
  }

  public static get validate() {
    return {
      input: (latitude?: number | null, longitude?: number | null) => {
        const result = Coordinates.schema.safeParse({ latitude, longitude });

        return {
          isValid: result.success,
          error: result.error?.issues[0]?.message,
          data: result.success ? result.data : undefined,
        };
      },
      params: {
        /**
         * 🚧 Enlem ve boylam çiftinden birinin eksik gelip gelmediğini kontrol eder
         */
        hasMissingPair: (
          latitude?: number | null,
          longitude?: number | null
        ) => {
          const latDefined = isDefined(latitude);
          const lonDefined = isDefined(longitude);

          // XOR
          const isMissing = latDefined !== lonDefined;

          return Guard.monitor(
            isMissing,
            !isMissing,
            () =>
              new InvalidCoordinatesFormatException(
                'Enlem ve boylam değerleri birlikte verilmelidir.'
              )
          );
        },
      },
    };
  }

  get latitude(): number {
    return this._latitude;
  }

  get longitude(): number {
    return this._longitude;
  }

  public static fromTrusted(latitude: number, longitude: number): Coordinates {
    return new Coordinates(latitude, longitude);
  }

  public static create(latitude?: number | null, longitude?: number | null) {
    const validation = Coordinates.validate.input(latitude, longitude);

    const instance = validation.isValid
      ? new Coordinates(validation.data!.latitude, validation.data!.longitude)
      : undefined;

    return {
      instance,
      orThrow(exception?: Error): Coordinates {
        if (!instance) {
          throw (
            exception ?? new InvalidCoordinatesFormatException(validation.error)
          );
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
   * İki koordinat arasındaki kuş uçuşu mesafe için Haversine formülü
   */
  public distanceTo(other: Coordinates): number {
    const EARTH_RADIUS_METERS = 6371000;

    const dLat = this._toRadians(other.latitude - this._latitude);
    const dLon = this._toRadians(other.longitude - this._longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRadians(this._latitude)) *
        Math.cos(this._toRadians(other.latitude)) *
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

  private _toRadians(degree: number): number {
    return (degree * Math.PI) / 180;
  }
}
