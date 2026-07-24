import {
  HotelbedsBooking as IHotelbedsBooking,
  HotelbedsBookingStatusSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { HotelbedsBookingStatusType as HotelbedsBookingStatus } from '@input-type-schemas/HotelbedsBookingStatusSchema';
import {
  JsonValueType,
  JsonValueType as JsonValue,
} from '@input-type-schemas/JsonValueSchema';
import { Money } from '@src/domain/value-objects/money.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { LastName } from '@src/domain/value-objects/last-name.vo';
import { Name } from '@src/domain/value-objects/name.vo';
import { CreateHotelbedsBookingProps } from '@modules/crm/health-tourism/hotel/domain/contracts/hotel.contracts';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { HotelbedsBookingRules } from '@modules/crm/health-tourism/hotel/domain/rules/hotelbeds-booking.rules';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { Guard } from '@common/domain/guards';

export class HotelbedsBooking extends AggregateRoot {
  constructor(data: IHotelbedsBooking) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._reference = data.reference;
    this._clientReference = data.clientReference;
    this._hotelCode = data.hotelCode;
    this._patientId = UUID.create(data.patientId).instance ?? null;
    this._leadId = UUID.create(data.leadId).instance ?? null;
    this._checkIn = data.checkIn;
    this._checkOut = data.checkOut;
    this._status = data.status;
    this._totalNet = Money.fromTrusted(data.totalNet, data.currency);
    this._holderName = Name.fromTrusted(data.holderName);
    this._holderSurname = LastName.fromTrusted(data.holderSurname);
    this._rooms = data.rooms;
    this._remarks = data.remarks;
    this._serviceFee =
      Money.create(data.serviceFee, data.currency).instance ?? null;
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _reference: string;
  get reference(): string {
    return this._reference;
  }

  private _clientReference: string | null;
  get clientReference(): string | null {
    return this._clientReference;
  }

  private _hotelCode: string;
  get hotelCode(): string {
    return this._hotelCode;
  }

  private _patientId: UUID | null;
  get patientId(): UUID | null {
    return this._patientId;
  }

  private _leadId: UUID | null;
  get leadId(): UUID | null {
    return this._leadId;
  }

  private _checkIn: Date;
  get checkIn(): Date {
    return this._checkIn;
  }

  private _checkOut: Date;
  get checkOut(): Date {
    return this._checkOut;
  }

  private _status: HotelbedsBookingStatus;

  get status(): HotelbedsBookingStatus {
    return this._status;
  }

  private _totalNet: Money;

  get totalNet(): Money {
    return this._totalNet;
  }

  private _holderName: Name;

  get holderName(): Name {
    return this._holderName;
  }

  private _holderSurname: LastName;

  get holderSurname(): LastName {
    return this._holderSurname;
  }

  private _rooms: JsonValue;

  get rooms(): JsonValue {
    return this._rooms;
  }

  private _remarks: string | null;

  get remarks(): string | null {
    return this._remarks;
  }

  private _serviceFee: Money | null;

  get serviceFee(): Money | null {
    return this._serviceFee;
  }

  private _organizationId: UUID;

  get organizationId(): UUID {
    return this._organizationId;
  }

  private _clinicId: UUID;

  get clinicId(): UUID {
    return this._clinicId;
  }

  private _createdAt: Date;

  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public get validate() {
    return {
      status: {
        isCancelled: this.isCancelled(),
      },
    };
  }

  public static create(props: CreateHotelbedsBookingProps): HotelbedsBooking {
    const currency = Currency.create(props.currency).orThrow();

    const totalNet = Money.create(props.totalNet, currency.value).orThrow();

    const serviceFee = props.serviceFee
      ? Money.create(props.serviceFee, currency.value).orThrow().value
      : null;

    const instance = new HotelbedsBooking({
      id: UUID.createOrGenerate(props.id).value,
      reference: props.reference,
      clientReference: props.clientReference ?? null,
      hotelCode: props.hotelCode,

      // Değer varsa UUID formatını doğrula, yoksa null geç
      patientId: props.patientId
        ? UUID.create(props.patientId).orThrow().value
        : null,
      leadId: props.leadId ? UUID.create(props.leadId).orThrow().value : null,

      checkIn: props.checkIn,
      checkOut: props.checkOut,
      status: props.status,
      totalNet: totalNet.value,
      currency: currency.value,
      holderName: props.holderName,
      holderSurname: props.holderSurname,
      rooms: props.rooms as JsonValueType,
      remarks: props.remarks ?? null,
      serviceFee: serviceFee,
      organizationId: props.organizationId,
      clinicId: props.clinicId,
      createdAt: DateTimeManager.create(),
      updatedAt: DateTimeManager.create(),
    });

    // TODO: Yeni bir rezervasyon başarıyla ayağa kalktığında event fırlat
    // instance.addDomainEvent();

    return instance;
  }

  public rules(validateOptions: ValidateOptionsType) {
    return new HotelbedsBookingRules(this, validateOptions);
  }

  public cancel(): void {
    if (this._status === HotelbedsBookingStatusSchema.enum.CANCELLED) {
      return;
    }

    // TODO: domain event pushlanacak
    this._status = HotelbedsBookingStatusSchema.enum.CANCELLED;
    this._updatedAt = DateTimeManager.create();
  }

  toPersistence(): IHotelbedsBooking {
    return {
      id: this.id.value,
      reference: this.reference,
      clientReference: this.clientReference,
      hotelCode: this.hotelCode,
      patientId: this.patientId?.value ?? null,
      leadId: this.leadId?.value ?? null,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      status: this.status,

      totalNet: this.totalNet.value,
      currency: this.totalNet.currency,

      holderName: this.holderName.value,
      holderSurname: this.holderSurname.value,
      rooms: this.rooms ?? null,
      remarks: this.remarks,

      serviceFee: this.serviceFee?.value ?? null,

      organizationId: this.organizationId.value,
      clinicId: this.clinicId?.value ?? null,
      createdAt: this.createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }

  private isCancelled() {
    const is = this._status === HotelbedsBookingStatusSchema.enum.CANCELLED;

    return Guard.monitor(
      is,
      is,
      () => new Error('Rezervasyon iptal edilmemiş')
    );
  }
}
