import { createZodDto } from 'nestjs-zod';
import { ConnectWhatsappChannelSchema } from '../../schemas/commands';

export class ConnectWhatsappChannelDto extends createZodDto(
  ConnectWhatsappChannelSchema
) {}
