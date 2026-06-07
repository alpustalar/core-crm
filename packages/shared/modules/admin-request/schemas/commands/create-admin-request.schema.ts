import { z } from 'zod';
import { AdminRequestType } from '../../types/admin-request-enums';

export const CreateAdminRequestSchema = z.object({
  type: z.enum(AdminRequestType),
  targetId: z.uuid(),
});
