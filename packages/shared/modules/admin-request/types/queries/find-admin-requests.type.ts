import { z } from 'zod';
import { FindAdminRequestsSchema } from '../../schemas/queries';

export type FindAdminRequests = z.infer<typeof FindAdminRequestsSchema>;
