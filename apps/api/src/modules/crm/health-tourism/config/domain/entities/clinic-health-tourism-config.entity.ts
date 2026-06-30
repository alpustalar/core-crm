import { ClinicHealthTourismConfig as IClinicHealthTourismConfig } from '@shared/generated-zod';
import { Prisma } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  CreateClinicHealthTourismConfigProps,
  UpdateClinicHealthTourismConfigProps,
} from '../config.contracts';

type Decimal = IClinicHealthTourismConfig['serviceFeePercent'];
type Currency = IClinicHealthTourismConfig['defaultCurrency'];

/**
 * Kliniğin sağlık-turizmi (otel + transfer) config'i — 1:1 satellite. AI asistanı hangi
 * otelleri (allowlist öncelikli, yoksa şehir destinationCode) arayacağını ve transferin
 * hangi havalimanı/hedef üzerinden kurulacağını buradan okur.
 */
export class ClinicHealthTourismConfig
  extends AggregateRoot
  implements IClinicHealthTourismConfig
{
  constructor(data: IClinicHealthTourismConfig) {
    super();
    this._id = data.id;
    this._isEnabled = data.isEnabled;
    this._destinationCode = data.destinationCode;
    this._nearbyHotelCodes = data.nearbyHotelCodes;
    this._airportIata = data.airportIata;
    this._clinicLocationType = data.clinicLocationType;
    this._clinicLocationCode = data.clinicLocationCode;
    this._pickupAddress = data.pickupAddress;
    this._serviceFeePercent = data.serviceFeePercent;
    this._defaultCurrency = data.defaultCurrency;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _isEnabled: boolean;
  get isEnabled(): boolean {
    return this._isEnabled;
  }

  private _destinationCode: string | null;
  get destinationCode(): string | null {
    return this._destinationCode;
  }

  private _nearbyHotelCodes: string[];
  get nearbyHotelCodes(): string[] {
    return this._nearbyHotelCodes;
  }

  private _airportIata: string | null;
  get airportIata(): string | null {
    return this._airportIata;
  }

  private _clinicLocationType: string | null;
  get clinicLocationType(): string | null {
    return this._clinicLocationType;
  }

  private _clinicLocationCode: string | null;
  get clinicLocationCode(): string | null {
    return this._clinicLocationCode;
  }

  private _pickupAddress: string | null;
  get pickupAddress(): string | null {
    return this._pickupAddress;
  }

  private _serviceFeePercent: Decimal;
  get serviceFeePercent(): Decimal {
    return this._serviceFeePercent;
  }

  private _defaultCurrency: Currency;
  get defaultCurrency(): Currency {
    return this._defaultCurrency;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
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

  public static create(
    props: CreateClinicHealthTourismConfigProps
  ): ClinicHealthTourismConfig {
    const now = new Date();
    return new ClinicHealthTourismConfig({
      id: props.id ?? crypto.randomUUID(),
      clinicId: props.clinicId,
      organizationId: props.organizationId,
      isEnabled: props.isEnabled ?? false,
      destinationCode: props.destinationCode ?? null,
      nearbyHotelCodes: props.nearbyHotelCodes ?? [],
      airportIata: props.airportIata ?? null,
      clinicLocationType: props.clinicLocationType ?? null,
      clinicLocationCode: props.clinicLocationCode ?? null,
      pickupAddress: props.pickupAddress ?? null,
      serviceFeePercent: ClinicHealthTourismConfig.toDecimal(
        props.serviceFeePercent
      ),
      defaultCurrency: props.defaultCurrency ?? 'EUR',
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Yalnız sağlanan (undefined olmayan) alanları günceller. */
  public updateSettings(props: UpdateClinicHealthTourismConfigProps): void {
    if (props.isEnabled !== undefined) this._isEnabled = props.isEnabled;
    if (props.destinationCode !== undefined) {
      this._destinationCode = props.destinationCode;
    }
    if (props.nearbyHotelCodes !== undefined) {
      this._nearbyHotelCodes = props.nearbyHotelCodes;
    }
    if (props.airportIata !== undefined) this._airportIata = props.airportIata;
    if (props.clinicLocationType !== undefined) {
      this._clinicLocationType = props.clinicLocationType;
    }
    if (props.clinicLocationCode !== undefined) {
      this._clinicLocationCode = props.clinicLocationCode;
    }
    if (props.pickupAddress !== undefined) {
      this._pickupAddress = props.pickupAddress;
    }
    if (props.serviceFeePercent !== undefined) {
      this._serviceFeePercent = ClinicHealthTourismConfig.toDecimal(
        props.serviceFeePercent
      );
    }
    if (props.defaultCurrency !== undefined) {
      this._defaultCurrency = props.defaultCurrency;
    }
  }

  public enable(): void {
    this._isEnabled = true;
  }

  public disable(): void {
    this._isEnabled = false;
  }

  /** Allowlist doluysa onu, yoksa şehir destinationCode'unu kullan (B0 kararı). */
  public get effectiveHotelScope(): {
    hotelCodes: string[] | null;
    destinationCode: string | null;
  } {
    if (this._nearbyHotelCodes.length > 0) {
      return { hotelCodes: this._nearbyHotelCodes, destinationCode: null };
    }
    return { hotelCodes: null, destinationCode: this._destinationCode };
  }

  public toPersistence(): IClinicHealthTourismConfig {
    return {
      id: this._id,
      isEnabled: this._isEnabled,
      destinationCode: this._destinationCode,
      nearbyHotelCodes: this._nearbyHotelCodes,
      airportIata: this._airportIata,
      clinicLocationType: this._clinicLocationType,
      clinicLocationCode: this._clinicLocationCode,
      pickupAddress: this._pickupAddress,
      serviceFeePercent: this._serviceFeePercent,
      defaultCurrency: this._defaultCurrency,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }

  private static toDecimal(value?: number | null): Decimal {
    return value === undefined || value === null
      ? null
      : new Prisma.Decimal(value);
  }
}
