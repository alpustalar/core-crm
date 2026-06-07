import { z } from 'zod';

export const CancelHotelBookingSchema = z.object({
  bookingId: z.string().uuid(),
});
