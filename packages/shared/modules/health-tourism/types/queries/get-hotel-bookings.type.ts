import { z } from 'zod';
import { GetHotelBookingsSchema } from '../../schemas/queries';

export type GetHotelBookings = z.infer<typeof GetHotelBookingsSchema>;
