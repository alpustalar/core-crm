import { z } from 'zod';
import { GetTransferBookingsSchema } from '../../schemas/queries/get-transfer-bookings.schema';

export type GetTransferBookings = z.infer<typeof GetTransferBookingsSchema>;
