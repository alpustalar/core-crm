import { z } from 'zod';
import { CancelTransferBookingSchema } from '../../schemas/commands/cancel-transfer-booking.schema';

export type CancelTransferBooking = z.infer<typeof CancelTransferBookingSchema>;
