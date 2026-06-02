import { z } from 'zod';
import { PaxRefundSchema } from '../../schemas/commands';

export type PaxRefund = z.infer<typeof PaxRefundSchema>;
