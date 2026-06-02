import { createZodDto } from 'nestjs-zod';
import { UpdateUserByStaffSchema } from '@shared/modules/user/schemas/commands/update-user-by-staff.schema';

export class UpdateUserByStaffDto extends createZodDto(
  UpdateUserByStaffSchema
) {}
