import { z } from 'zod';
import { UpdateUserByStaffSchema } from '@shared/modules/user/schemas/commands/update-user-by-staff.schema';

export type UpdateUserByStaff = z.infer<typeof UpdateUserByStaffSchema>;
