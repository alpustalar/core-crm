import { z } from 'zod';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { HotelbedsBookingStatusSchema } from '@shared';
import { LogSource } from '@src/domain/constants/log-action.constant';

// ==========================================
// 1. YARDIMCI VE ALT ŞEMALAR
// ==========================================

export const CancellationPolicySchema = z.object({
  amount: z.string(),
  from: z.string(),
});
export type CancellationPolicy = z.infer<typeof CancellationPolicySchema>;

export const HotelRateSchema = z.object({
  rateKey: z.string(),
  rateType: z.enum(['BOOKABLE', 'RECHECK']),
  net: z.number(),
  currency: z.string(),
  boardCode: z.string(),
  boardName: z.string().optional(),
  rooms: z.number(),
  adults: z.number(),
  children: z.number(),
  cancellationPolicies: z.array(CancellationPolicySchema).optional(),
});
export type HotelRate = z.infer<typeof HotelRateSchema>;

export const HotelRoomOptionSchema = z.object({
  code: z.string(),
  name: z.string().optional(),
  rates: z.array(HotelRateSchema),
});
export type HotelRoomOption = z.infer<typeof HotelRoomOptionSchema>;

// ==========================================
// 2. ANA SÖZLEŞME VE FİLTRE ŞEMALARI
// ==========================================

// --- CREATE BOOKING ---
export const CreateHotelbedsBookingSchema = z.object({
  id: z.uuid(),
  reference: z.string(),
  clientReference: z.string().nullable().optional(),
  hotelCode: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  totalNet: z.number(),
  currency: CurrencySchema,
  holderName: z.string(),
  holderSurname: z.string(),
  rooms: z.unknown(),
  patientId: z.uuid().optional(),
  leadId: z.uuid().optional(),
  remarks: z.string().optional(),
  serviceFee: z.number().optional(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
});
export type CreateHotelbedsBookingData = z.infer<
  typeof CreateHotelbedsBookingSchema
>;

/** Rezervasyon iptali — entity iptal event'ini kendisi raise eder. */
export const CancelHotelbedsBookingSchema = z.object({
  actorId: z.string(),
  logSource: z.nativeEnum(LogSource),
  reason: z.string().optional(),
});
export type CancelHotelbedsBookingProps = z.infer<
  typeof CancelHotelbedsBookingSchema
>;

// --- FILTERS ---
export const FindHotelBookingsFilterSchema = z.object({
  organizationId: z.uuid(),
  patientId: z.uuid().optional(),
  leadId: z.uuid().optional(),
});

export type FindHotelBookingsFilter = z.infer<
  typeof FindHotelBookingsFilterSchema
>;

// --- AVAILABILITY ITEM ---
export const HotelAvailabilityItemSchema = z.object({
  code: z.string(),
  name: z.string(),
  categoryCode: z.string().optional(),
  categoryName: z.string().optional(),
  destinationCode: z.string().optional(),
  destinationName: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  currency: z.string(),
  minRate: z.number(),
  maxRate: z.number(),
  rooms: z.array(HotelRoomOptionSchema),
});
export type HotelAvailabilityItem = z.infer<typeof HotelAvailabilityItemSchema>;

export const CreateHotelbedsBookingPropsSchema = z
  .object({
    id: z.uuid().optional(),
    reference: z.string().min(1, 'Referans numarası zorunludur'),
    clientReference: z.string().nullable().optional(),
    hotelCode: z.string().min(1, 'Hotel kodu zorunludur'),

    // Hasta veya Lead ilişkisi (Biri zorunlu olabilir veya opsiyonel kalabilir)
    patientId: z.uuid().nullable().optional(),
    leadId: z.uuid().nullable().optional(),

    checkIn: z.date(),
    checkOut: z.date(),

    status: HotelbedsBookingStatusSchema,

    totalNet: z.number().positive('Tutar pozitif olmalıdır'),
    currency: z.string().length(3, 'Para birimi 3 karakter olmalıdır (ISO)'),

    holderName: z.string().min(1),
    holderSurname: z.string().min(1),

    rooms: z.unknown(), // JsonValue yerine daha spesifik bir Room schema'sı ileride eklenebilir

    remarks: z.string().nullable().optional(),
    serviceFee: z.number().nonnegative().nullable().optional(),

    organizationId: z.uuid(),
    clinicId: z.uuid(),

    // Event entity içinde raise edildiği için "kim/nereden" bilgisi entity'ye
    // buradan taşınır (bkz. CLAUDE.md — event entity'de raise edilir).
    actorId: z.string(),
    logSource: z.nativeEnum(LogSource),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Check-out tarihi, Check-in tarihinden sonra olmalıdır',
    path: ['checkOut'],
  });

export type CreateHotelbedsBookingProps = z.infer<
  typeof CreateHotelbedsBookingPropsSchema
>;

// ==========================================
// AI RATE-OPTION TOKEN (kısa optionId → HotelBeds rezervasyon bağlamı)
// ==========================================

/**
 * `search_hotels`'in cache'e yazdığı, `book_hotel`'in optionId i11le çözdüğü rezervasyon
 * bağlamı. AI kısa bir optionId sunar; gerçek rateKey + fiyat/tarih burada saklanır.
 */
export interface HotelRateOptionToken {
  hotelCode: string;
  hotelName: string;
  roomName: string;
  boardName: string;
  rateKey: string;
  checkIn: string;
  checkOut: string;
  net: number;
  currency: string;
  adults: number;
  children: number;
}
