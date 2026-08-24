import { HotelbedsBookingStatusType } from '@input-type-schemas/HotelbedsBookingStatusSchema';
import { LogSource } from '@src/domain/constants/log-action.constant';

// ==========================================
// CREATE BOOKING — entity static create() girişi
// NOT: checkOut > checkIn kuralı entity.create() içinde (Guard) uygulanır —
// eskiden yalnız hiç `.parse()` edilmeyen bir Zod `.refine()` içindeydi.
// ==========================================

export interface CreateHotelbedsBookingProps {
  id?: string;
  reference: string;
  clientReference?: string | null;
  hotelCode: string;

  // Hasta veya Lead ilişkisi (Biri zorunlu olabilir veya opsiyonel kalabilir)
  patientId?: string | null;
  leadId?: string | null;

  checkIn: Date;
  checkOut: Date;

  status: HotelbedsBookingStatusType;

  totalNet: number;
  currency: string;

  holderName: string;
  holderSurname: string;

  rooms: unknown; // JsonValue yerine daha spesifik bir Room schema'sı ileride eklenebilir

  remarks?: string | null;
  serviceFee?: number | null;

  organizationId: string;
  clinicId: string;

  // Event entity içinde raise edildiği için "kim/nereden" bilgisi entity'ye
  // buradan taşınır (bkz. CLAUDE.md — event entity'de raise edilir).
  actorId: string;
  logSource: LogSource;
}

/** Rezervasyon iptali — entity iptal event'ini kendisi raise eder. */
export interface CancelHotelbedsBookingProps {
  actorId: string;
  logSource: LogSource;
  reason?: string;
}
