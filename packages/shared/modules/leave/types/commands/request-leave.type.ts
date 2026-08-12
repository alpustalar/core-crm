import { z } from 'zod';
import { RequestLeaveSchema } from '../../schemas/commands';

export type RequestLeave = z.infer<typeof RequestLeaveSchema>;
