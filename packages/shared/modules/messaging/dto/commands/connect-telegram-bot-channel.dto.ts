import { createZodDto } from 'nestjs-zod';
import { ConnectTelegramBotChannelSchema } from '../../schemas/commands';

export class ConnectTelegramBotChannelDto extends createZodDto(
  ConnectTelegramBotChannelSchema
) {}
