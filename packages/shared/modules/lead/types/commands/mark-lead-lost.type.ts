import { z } from 'zod';
import { MarkLeadLostSchema } from '../../schemas/commands';

export type MarkLeadLost = z.infer<typeof MarkLeadLostSchema>;
