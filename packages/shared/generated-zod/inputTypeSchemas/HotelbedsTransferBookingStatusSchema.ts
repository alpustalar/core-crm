import { z } from 'zod';

export const HotelbedsTransferBookingStatusSchema = z.enum(['CONFIRMED','CANCELLED','MODIFIED']);

export type HotelbedsTransferBookingStatusType = `${z.infer<typeof HotelbedsTransferBookingStatusSchema>}`

export default HotelbedsTransferBookingStatusSchema;
