import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { HOTEL_BOOKING_EVENTS } from '@src/domain/constants/events/health-tourism.constant';

export interface HotelBookingCancelledEventPayload extends IAuditLog {
  readonly bookingId: string;
  readonly reference: string;
  readonly clinicId: string;
  readonly organizationId: string;
}

export class HotelBookingCancelledEvent extends BaseEvent {
  static readonly NAME = HOTEL_BOOKING_EVENTS.CANCELLED;

  public readonly bookingId: string;
  public readonly reference: string;
  public readonly clinicId: string;
  public readonly organizationId: string;

  constructor(payload: HotelBookingCancelledEventPayload) {
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
  }
}
