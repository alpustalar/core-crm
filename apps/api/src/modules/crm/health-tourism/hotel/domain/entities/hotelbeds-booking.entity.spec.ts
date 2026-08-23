import { randomUUID } from 'crypto';
import { HotelbedsBooking } from './hotelbeds-booking.entity';
import {
  HotelBookingCancelledEvent,
  HotelBookingCreatedEvent,
} from '@modules/crm/health-tourism/hotel/domain/events';
import { LogSource } from '@src/domain/constants/log-action.constant';

describe('HotelbedsBooking entity — rezervasyon event\'leri', () => {
  const clinicId = randomUUID();
  const organizationId = randomUUID();
  const audit = { actorId: 'user-1', logSource: LogSource.WEB };

  const build = () =>
    HotelbedsBooking.create({
      id: randomUUID(),
      reference: 'HB-12345',
      hotelCode: 'HTL-1',
      checkIn: new Date('2026-09-01'),
      checkOut: new Date('2026-09-05'),
      status: 'PENDING',
      totalNet: 4500,
      currency: 'EUR',
      holderName: 'Ada',
      holderSurname: 'Lovelace',
      rooms: [],
      organizationId,
      clinicId,
      ...audit,
    });

  it('create → HotelBookingCreatedEvent (referans + kiracı kapsamı taşır)', () => {
    const booking = build();

    const events = booking.getDomainEvents();
    expect(events).toHaveLength(1);

    const event = events[0] as HotelBookingCreatedEvent;
    expect(event).toBeInstanceOf(HotelBookingCreatedEvent);
    expect(event.reference).toBe('HB-12345');
    expect(event.clinicId).toBe(clinicId);
    expect(event.organizationId).toBe(organizationId);
    expect(event.currency).toBe('EUR');
    expect(event.log?.actorId).toBe('user-1');
    expect(event.log?.source).toBe(LogSource.WEB);
  });

  it('cancel → HotelBookingCancelledEvent, sebep denetim metnine girer', () => {
    const booking = build();
    booking.clearDomainEvents();

    booking.cancel({ ...audit, reason: 'Hasta vazgeçti' });

    const event = booking.getDomainEvents()[0] as HotelBookingCancelledEvent;
    expect(event).toBeInstanceOf(HotelBookingCancelledEvent);
    expect(event.bookingId).toBe(booking.id.value);
    expect(event.log?.details).toContain('Hasta vazgeçti');
  });

  it('zaten iptalli rezervasyonda ikinci cancel event üretmez', () => {
    // İptal handler'ı bu yolu idempotent kabul ediyor (eşzamanlı iki istek);
    // ikinci kez event fırlatmak mükerrer denetim kaydı yazardı.
    const booking = build();
    booking.cancel(audit);
    booking.clearDomainEvents();

    booking.cancel(audit);

    expect(booking.getDomainEvents()).toHaveLength(0);
  });
});
