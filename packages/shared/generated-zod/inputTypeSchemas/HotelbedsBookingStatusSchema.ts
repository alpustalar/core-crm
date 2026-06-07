import { z } from 'zod';

export const HotelbedsBookingStatusSchema = z.enum(['CONFIRMED','CANCELLED','PENDING']);

export type HotelbedsBookingStatusType = `${z.infer<typeof HotelbedsBookingStatusSchema>}`

export default HotelbedsBookingStatusSchema;
