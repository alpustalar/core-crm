import { createZodDto } from 'nestjs-zod';
import { ConnectMetaAccountSchema } from '../../schemas/commands';

export class ConnectMetaAccountDto extends createZodDto(
  ConnectMetaAccountSchema,
) {}
