import {
  HotelbedsTransferBooking as IHotelbedsTransferBooking,
  HotelbedsTransferBookingStatusSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';
import { HotelbedsTransferBookingStatusType as HotelbedsTransferBookingStatus } from '@input-type-schemas/HotelbedsTransferBookingStatusSchema';
import { Money } from '@src/domain/value-objects/money.vo';

export class HotelbedsTransferBooking extends AggregateRoot {
  constructor(data: IHotelbedsTransferBooking) {
    super();
    this._id = data.id;
    this._reference = data.reference;
    this._clientReference = data.clientReference;
    this._status = data.status;
    this._holderName = data.holderName;
    this._holderSurname = data.holderSurname;
    this._holderEmail = data.holderEmail;
    this._holderPhone = data.holderPhone;
    this._transfers = data.transfers;
    this._totalAmount = Money.create(data.totalAmount, data.currency);
    this._remarks = data.remarks;
    this._organizationId = data.organizationId;
    this._clinicId = data.clinicId;
    this._patientId = data.patientId;
    this._leadId = data.leadId;
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

  private _clientReference: string | null;
  get clientReference(): string | null {
    return this._clientReference;
  }

  private _status: HotelbedsTransferBookingStatus;
  get status(): HotelbedsTransferBookingStatus {
    return this._status;
  }

  private _holderName: string;
  get holderName(): string {
    return this._holderName;
  }

  private _holderSurname: string;
  get holderSurname(): string {
    return this._holderSurname;
  }

  private _holderEmail: string;
  get holderEmail(): string {
    return this._holderEmail;
  }

  private _holderPhone: string;
  get holderPhone(): string {
    return this._holderPhone;
  }

  private _transfers: JsonValue;
  get transfers(): JsonValue {
    return this._transfers;
  }

  private _totalAmount: Money;
  get totalAmount(): Money {
    return this._totalAmount;
  }

  private _remarks: string | null;
  get remarks(): string | null {
    return this._remarks;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _clinicId: string | null;
  get clinicId(): string | null {
    return this._clinicId;
  }

  private _patientId: string | null;
  get patientId(): string | null {
    return this._patientId;
  }

  private _leadId: string | null;
  get leadId(): string | null {
    return this._leadId;
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
    if (this._status === HotelbedsTransferBookingStatusSchema.enum.CANCELLED) {
      throw new Error('Transfer rezervasyonu zaten iptal edilmiş.');
    }
    this._status = HotelbedsTransferBookingStatusSchema.enum.CANCELLED;
  }

  public isCancelled(): boolean {
    return this._status === HotelbedsTransferBookingStatusSchema.enum.CANCELLED;
  }

  toPersistence(): IHotelbedsTransferBooking {
    return {
      id: this._id,
      reference: this._reference,
      clientReference: this._clientReference,
      status: this._status,
      holderName: this._holderName,
      holderSurname: this._holderSurname,
      holderEmail: this._holderEmail,
      holderPhone: this._holderPhone,
      transfers: this._transfers,
      totalAmount: this._totalAmount.amount,
      currency: this.totalAmount.currency,
      remarks: this._remarks,
      organizationId: this._organizationId,
      clinicId: this._clinicId,
      patientId: this._patientId,
      leadId: this._leadId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
