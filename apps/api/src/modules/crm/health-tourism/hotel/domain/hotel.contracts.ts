import { z } from 'zod';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';

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
  clinicId: z.uuid().optional(),
});
export type CreateHotelbedsBookingData = z.infer<
  typeof CreateHotelbedsBookingSchema
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
