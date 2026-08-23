import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { HOTEL_BOOKING_EVENTS } from '@src/domain/constants/events/health-tourism.constant';

export interface HotelBookingCreatedEventPayload extends IAuditLog {
  readonly bookingId: string;
  /** HotelBeds'in ürettiği rezervasyon referansı — dış sistemle eşleştirme anahtarı. */
  readonly reference: string;
  readonly clinicId: string;
  readonly organizationId: string;
  readonly patientId: string | null;
  readonly leadId: string | null;
  readonly totalNet: string;
  readonly currency: string;
}

export class HotelBookingCreatedEvent extends BaseEvent {
  static readonly NAME = HOTEL_BOOKING_EVENTS.CREATED;

  public readonly bookingId: string;
  public readonly reference: string;
  public readonly clinicId: string;
  public readonly organizationId: string;
  public readonly patientId: string | null;
  public readonly leadId: string | null;
  public readonly totalNet: string;
  public readonly currency: string;

  constructor(payload: HotelBookingCreatedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.bookingId = payload.bookingId;
    this.reference = payload.reference;
    this.clinicId = payload.clinicId;
    this.organizationId = payload.organizationId;
    this.patientId = payload.patientId;
    this.leadId = payload.leadId;
    this.totalNet = payload.totalNet;
    this.currency = payload.currency;
  }
}
