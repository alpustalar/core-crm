import { z } from 'zod';
import { CreateAdminRequestSchema } from '../../schemas/commands';

export type CreateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;
