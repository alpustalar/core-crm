import {
  HotelbedsBooking as IHotelbedsBooking,
  HotelbedsBookingStatusSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { HotelbedsBookingStatusType as HotelbedsBookingStatus } from '@input-type-schemas/HotelbedsBookingStatusSchema';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';
import { Money } from '@src/domain/value-objects/money.vo';

export class HotelbedsBooking extends AggregateRoot {
  constructor(data: IHotelbedsBooking) {
    super();
    this._id = data.id;
    this._reference = data.reference;
    this._hotelCode = data.hotelCode;
    this._patientId = data.patientId;
    this._leadId = data.leadId;
    this._checkIn = data.checkIn;
    this._checkOut = data.checkOut;
    this._status = data.status;
    this._totalNet = Money.create(data.totalNet, data.currency);
    this._holderName = data.holderName;
    this._holderSurname = data.holderSurname;
    this._rooms = data.rooms;
    this._remarks = data.remarks;
    this._serviceFee = data.serviceFee
      ? Money.create(data.serviceFee, data.currency)
      : null;
    this._organizationId = data.organizationId;
    this._clinicId = data.clinicId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _reference: string;
  get reference(): string {
    return this._reference;
  }

  private _hotelCode: string;
  get hotelCode(): string {
    return this._hotelCode;
  }

  private _patientId: string | null;
  get patientId(): string | null {
    return this._patientId;
  }

  private _leadId: string | null;
  get leadId(): string | null {
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

  private _holderName: string;
  get holderName(): string {
    return this._holderName;
  }

  private _holderSurname: string;
  get holderSurname(): string {
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

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _clinicId: string | null;
  get clinicId(): string | null {
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

  public cancel(): void {
    if (this._status === HotelbedsBookingStatusSchema.enum.CANCELLED) {
      throw new Error('Rezervasyon zaten iptal edilmiş.');
    }
    this._status = HotelbedsBookingStatusSchema.enum.CANCELLED;
  }

  public isCancelled(): boolean {
    return this._status === HotelbedsBookingStatusSchema.enum.CANCELLED;
  }

  toPersistence(): IHotelbedsBooking {
    return {
      id: this._id,
      reference: this._reference,
      hotelCode: this._hotelCode,
      patientId: this._patientId,
      leadId: this._leadId,
      checkIn: this._checkIn,
      checkOut: this._checkOut,
      status: this._status,

      totalNet: this._totalNet.amount,
      currency: this._totalNet.currency,

      holderName: this._holderName,
      holderSurname: this._holderSurname,
      rooms: this._rooms ?? null,
      remarks: this._remarks,

      serviceFee: this._serviceFee?.amount ?? null,

      organizationId: this._organizationId,
      clinicId: this._clinicId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
