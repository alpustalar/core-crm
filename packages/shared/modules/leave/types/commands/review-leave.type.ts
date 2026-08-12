import { z } from 'zod';
import { ReviewLeaveSchema } from '../../schemas/commands';

export type ReviewLeave = z.infer<typeof ReviewLeaveSchema>;
