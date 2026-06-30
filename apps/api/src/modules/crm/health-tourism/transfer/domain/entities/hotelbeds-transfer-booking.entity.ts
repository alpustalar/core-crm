import {
  HotelbedsTransferBooking as IHotelbedsTransferBooking,
  HotelbedsTransferBookingStatusSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';
import { HotelbedsTransferBookingStatusType as HotelbedsTransferBookingStatus } from '@input-type-schemas/HotelbedsTransferBookingStatusSchema';
import { Money } from '@src/domain/value-objects/money.vo';
import { HotelbedsTransferAlreadyCancelledException } from '@modules/crm/health-tourism/transfer/domain/exceptions/hotelbeds-transfer.exceptions';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { Decimal } from 'decimal.js';
import {
  CreateTransferBookingProps,
  UpdateTransferHolderProps,
} from '@modules/crm/health-tourism/transfer/domain/transfer.contracts';

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
    this._totalAmount = Money.create(data.totalAmount, data.currency).orThrow();
    this._remarks = data.remarks;
    this._organizationId = data.organizationId;
    this._clinicId = data.clinicId;
    this._patientId = data.patientId;
    this._leadId = data.leadId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Private Properties & Getters
  // ────────────────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────────────────
  // Static Create Method (Factory)
  // ────────────────────────────────────────────────────────────────────────────
  public static create(
    props: CreateTransferBookingProps
  ): HotelbedsTransferBooking {
    const currencyValue = Currency.create(props.currency).orThrow();

    const amountValue =
      props.totalAmount instanceof Decimal ||
      typeof props.totalAmount === 'number'
        ? Money.create(props.totalAmount, currencyValue.value).orThrow()
        : props.totalAmount;

    return new HotelbedsTransferBooking({
      id: props.id ?? crypto.randomUUID(),
      reference: props.reference,
      clientReference: props.clientReference ?? null,
      status: props.status,
      holderName: props.holderName.trim(),
      holderSurname: props.holderSurname.trim(),
      holderEmail: props.holderEmail.toLowerCase().trim(),
      holderPhone: props.holderPhone.trim(),
      transfers: props.transfers,
      totalAmount: amountValue.amount,
      currency: currencyValue.value,
      remarks: props.remarks ?? null,
      organizationId: props.organizationId,
      clinicId: props.clinicId ?? null,
      patientId: props.patientId ?? null,
      leadId: props.leadId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 🚀 Public Domain Methods (Zengin İş Kuralları)
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Rezervasyonu yapan asıl yolcu/sorumlu (Holder) bilgilerini günceller.
   */
  public updateHolderDetails(props: UpdateTransferHolderProps): void {
    if (this.isCancelled()) {
      throw new Error(
        'İptal edilmiş bir transfer rezervasyonunun bilgileri güncellenemez.'
      );
    }

    this._holderName = props.holderName.trim();
    this._holderSurname = props.holderSurname.trim();
    this._holderEmail = props.holderEmail.toLowerCase().trim();
    this._holderPhone = props.holderPhone.trim();

    if (props.remarks !== undefined) {
      this._remarks = props.remarks;
    }

    this._updatedAt = new Date();
  }

  /**
   * Dış servisten (Hotelbeds) gelen senkronizasyonlarda durum ve transfer detaylarını günceller.
   */
  public syncFromProvider(
    status: HotelbedsTransferBookingStatus,
    transfers: JsonValue,
    totalAmount: Money
  ): void {
    this._status = status;
    this._transfers = transfers;
    this._totalAmount = totalAmount;
    this._updatedAt = new Date();
  }

  public cancel(): void {
    if (this.isCancelled()) {
      throw new HotelbedsTransferAlreadyCancelledException();
    }
    this._status = HotelbedsTransferBookingStatusSchema.enum.CANCELLED;
    this._updatedAt = new Date();
  }

  public isCancelled(): boolean {
    return this._status === HotelbedsTransferBookingStatusSchema.enum.CANCELLED;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Mapping to Persistence
  // ────────────────────────────────────────────────────────────────────────────
  public toPersistence(): IHotelbedsTransferBooking {
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
      currency: this._totalAmount.currency,
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
