import { createZodDto } from 'nestjs-zod';
import { UserUpdateBySelfSchema } from '@shared/modules/user/schemas/commands/user-update-by-self.schema';

export class UserUpdateBySelfDto extends createZodDto(UserUpdateBySelfSchema) {}
