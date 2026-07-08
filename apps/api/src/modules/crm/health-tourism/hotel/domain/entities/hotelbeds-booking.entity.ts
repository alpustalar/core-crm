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
import { HotelbedsBookingAlreadyCancelledException } from '@modules/crm/health-tourism/hotel/domain/exceptions/hotelbeds-booking.exceptions';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { LastName } from '@src/domain/value-objects/last-name.vo';
import { Name } from '@src/domain/value-objects/name.vo';
import { CreateHotelbedsBookingProps } from '@modules/crm/health-tourism/hotel/domain/hotel.contracts';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { shouldValidate } from '@common/domain/utils/should-validate';
import { Currency } from '@src/domain/value-objects/currency.vo';

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

  public static create(
    props: CreateHotelbedsBookingProps,
    options = DefaultValidateOptions
  ): HotelbedsBooking {
    if (shouldValidate(options)) {
      if (props.checkOut <= props.checkIn) {
        throw new Error(
          'Check-out tarihi, check-in tarihinden önce veya eşit olamaz.'
        );
      }
    }

    const currency = Currency.create(props.currency).orThrow();

    const totalNet = Money.create(props.totalNet, currency.value).orThrow();

    const serviceFee = props.serviceFee
      ? Money.create(props.serviceFee, currency.value).orThrow().amount
      : null;

    const id = props.id ? UUID.create(props.id).orThrow() : UUID.generate();

    const instance = new HotelbedsBooking({
      id: id.value,
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
      totalNet: totalNet.amount,
      currency: currency.value,
      holderName: props.holderName,
      holderSurname: props.holderSurname,
      rooms: props.rooms as JsonValueType,
      remarks: props.remarks ?? null,
      serviceFee: serviceFee,
      organizationId: props.organizationId,
      clinicId: props.clinicId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // TODO: Yeni bir rezervasyon başarıyla ayağa kalktığında event fırlat
    // instance.addDomainEvent();

    return instance;
  }

  public cancel(): void {
    if (this._status === HotelbedsBookingStatusSchema.enum.CANCELLED) {
      throw new HotelbedsBookingAlreadyCancelledException(this._reference);
    }

    // TODO: domain event pushlanacak
    this._status = HotelbedsBookingStatusSchema.enum.CANCELLED;
  }

  public isCancelled(): boolean {
    return this._status === HotelbedsBookingStatusSchema.enum.CANCELLED;
  }

  toPersistence(): IHotelbedsBooking {
    return {
      id: this._id.value,
      reference: this._reference,
      clientReference: this._clientReference,
      hotelCode: this._hotelCode,
      patientId: this._patientId?.value ?? null,
      leadId: this._leadId?.value ?? null,
      checkIn: this._checkIn,
      checkOut: this._checkOut,
      status: this._status,

      totalNet: this._totalNet.amount,
      currency: this._totalNet.currency,

      holderName: this._holderName.value,
      holderSurname: this._holderSurname.value,
      rooms: this._rooms ?? null,
      remarks: this._remarks,

      serviceFee: this._serviceFee?.amount ?? null,

      organizationId: this._organizationId.value,
      clinicId: this._clinicId?.value ?? null,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
