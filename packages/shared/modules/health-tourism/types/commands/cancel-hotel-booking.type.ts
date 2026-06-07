import { z } from 'zod';
import { CancelHotelBookingSchema } from '../../schemas/commands';

export type CancelHotelBooking = z.infer<typeof CancelHotelBookingSchema>;
