import { ClinicHealthTourismConfig as IClinicHealthTourismConfig } from '@shared/generated-zod';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  CreateClinicHealthTourismConfigProps,
  UpdateClinicHealthTourismConfigProps,
} from '../config.contracts';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Decimal } from 'decimal.js';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { isDefined } from '@common/utils';
import { isNotUndefined } from '@common/utils/is-not-undefined';

/**
 * Kliniğin sağlık-turizmi (otel + transfer) config'i — 1:1 satellite. AI asistanı hangi
 * otelleri (allowlist öncelikli, yoksa şehir destinationCode) arayacağını ve transferin
 * hangi havalimanı/hedef üzerinden kurulacağını buradan okur.
 */
export class ClinicHealthTourismConfig extends AggregateRoot {
  constructor(data: IClinicHealthTourismConfig) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._isEnabled = data.isEnabled;
    this._destinationCode = data.destinationCode;
    this._nearbyHotelCodes = data.nearbyHotelCodes;
    this._airportIata = data.airportIata;
    this._clinicLocationType = data.clinicLocationType;
    this._clinicLocationCode = data.clinicLocationCode;
    this._pickupAddress = data.pickupAddress;
    this._serviceFeePercent = data.serviceFeePercent
      ? Decimal(data.serviceFeePercent)
      : null;
    this._defaultCurrency = Currency.fromTrusted(data.defaultCurrency);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
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

  private _serviceFeePercent: Decimal | null;
  get serviceFeePercent(): Decimal | null {
    return this._serviceFeePercent;
  }

  private _defaultCurrency: Currency;
  get defaultCurrency(): Currency {
    return this._defaultCurrency;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
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

  public static create(
    props: CreateClinicHealthTourismConfigProps
  ): ClinicHealthTourismConfig {
    const now = DateTimeManager.create();

    const id = props.id ? UUID.create(props.id).orThrow() : UUID.generate();

    return new ClinicHealthTourismConfig({
      id: id.value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      organizationId: UUID.create(props.organizationId).orThrow().value,
      isEnabled: props.isEnabled ?? false,
      destinationCode: props.destinationCode ?? null,
      nearbyHotelCodes: props.nearbyHotelCodes ?? [],
      airportIata: props.airportIata ?? null,
      clinicLocationType: props.clinicLocationType ?? null,
      clinicLocationCode: props.clinicLocationCode ?? null,

      pickupAddress: props.pickupAddress ?? null,

      serviceFeePercent: props.serviceFeePercent
        ? new Decimal(props.serviceFeePercent)
        : null,

      defaultCurrency: props.defaultCurrency ?? Currency.enum.EUR,

      createdAt: now,
      updatedAt: now,
    });
  }

  /** Yalnız sağlanan (undefined olmayan) alanları günceller. */
  public updateSettings(props: UpdateClinicHealthTourismConfigProps): void {
    if (isDefined(props.isEnabled)) this._isEnabled = props.isEnabled;

    if (isNotUndefined(props.destinationCode)) {
      this._destinationCode = props.destinationCode;
    }

    if (isDefined(props.nearbyHotelCodes)) {
      this._nearbyHotelCodes = props.nearbyHotelCodes;
    }
    if (isNotUndefined(props.airportIata))
      this._airportIata = props.airportIata;

    if (props.clinicLocationType !== undefined) {
      this._clinicLocationType = props.clinicLocationType;
    }
    if (isNotUndefined(props.clinicLocationCode)) {
      this._clinicLocationCode = props.clinicLocationCode;
    }
    if (isNotUndefined(props.pickupAddress)) {
      this._pickupAddress = props.pickupAddress;
    }
    // null = temizle, undefined = dokunma (diğer nullable alanlarla simetrik).
    if (isNotUndefined(props.serviceFeePercent)) {
      this._serviceFeePercent =
        props.serviceFeePercent === null
          ? null
          : new Decimal(props.serviceFeePercent);
    }
    if (isDefined(props.defaultCurrency)) {
      this._defaultCurrency = Currency.create(props.defaultCurrency).orThrow();
    }
  }

  public enable(): void {
    this._isEnabled = true;
  }

  public disable(): void {
    this._isEnabled = false;
  }

  public toPersistence(): IClinicHealthTourismConfig {
    return {
      id: this._id.value,
      isEnabled: this._isEnabled,
      destinationCode: this._destinationCode,
      nearbyHotelCodes: this._nearbyHotelCodes,
      airportIata: this._airportIata,
      clinicLocationType: this._clinicLocationType,
      clinicLocationCode: this._clinicLocationCode,
      pickupAddress: this._pickupAddress,
      serviceFeePercent: this._serviceFeePercent,
      defaultCurrency: this._defaultCurrency.value,
      clinicId: this._clinicId.value,
      organizationId: this._organizationId.value,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }
}
