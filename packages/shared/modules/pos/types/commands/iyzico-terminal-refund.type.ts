import { z } from 'zod';
import { IyzicoTerminalRefundSchema } from '../../schemas/commands';

export type IyzicoTerminalRefund = z.infer<typeof IyzicoTerminalRefundSchema>;
