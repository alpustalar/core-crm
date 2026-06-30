import { createZodDto } from 'nestjs-zod';
import { ConnectInstagramChannelSchema } from '../../schemas/commands';

export class ConnectInstagramChannelDto extends createZodDto(
  ConnectInstagramChannelSchema
) {}
