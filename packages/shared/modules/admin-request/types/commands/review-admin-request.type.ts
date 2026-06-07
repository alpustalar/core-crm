import { z } from 'zod';
import { ReviewAdminRequestSchema } from '../../schemas/commands';

export type ReviewAdminRequest = z.infer<typeof ReviewAdminRequestSchema>;
