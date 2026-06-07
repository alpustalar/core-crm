import { z } from 'zod';
import { BookHotelSchema } from '../../schemas/commands';

export type BookHotel = z.infer<typeof BookHotelSchema>;
