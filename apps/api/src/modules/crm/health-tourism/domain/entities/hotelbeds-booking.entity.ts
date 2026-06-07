import {
  HotelbedsBooking as IHotelbedsBooking,
  HotelbedsBookingStatus,
  Prisma,
} from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { Decimal } from '@prisma/client/runtime/library';

export class HotelbedsBooking
  extends AggregateRoot
  implements IHotelbedsBooking
{
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
    this._totalNet = data.totalNet;
    this._currency = data.currency;
    this._holderName = data.holderName;
    this._holderSurname = data.holderSurname;
    this._rooms = data.rooms;
    this._remarks = data.remarks;
    this._serviceFee = data.serviceFee;
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

  private _totalNet: Decimal;
  get totalNet(): Decimal {
    return this._totalNet;
  }

  private _currency: string;
  get currency(): string {
    return this._currency;
  }

  private _holderName: string;
  get holderName(): string {
    return this._holderName;
  }

  private _holderSurname: string;
  get holderSurname(): string {
    return this._holderSurname;
  }

  private _rooms: Prisma.JsonValue;
  get rooms(): Prisma.JsonValue {
    return this._rooms;
  }

  private _remarks: string | null;
  get remarks(): string | null {
    return this._remarks;
  }

  private _serviceFee: Decimal | null;
  get serviceFee(): Decimal | null {
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
    if (this._status === HotelbedsBookingStatus.CANCELLED) {
      throw new Error('Rezervasyon zaten iptal edilmiş.');
    }
    this._status = HotelbedsBookingStatus.CANCELLED;
  }

  public isCancelled(): boolean {
    return this._status === HotelbedsBookingStatus.CANCELLED;
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
      totalNet: this._totalNet,
      currency: this._currency,
      holderName: this._holderName,
      holderSurname: this._holderSurname,
      rooms: this._rooms ?? null,
      remarks: this._remarks,
      serviceFee: this._serviceFee,
      organizationId: this._organizationId,
      clinicId: this._clinicId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
