import { z } from 'zod';
import { ConnectTelegramBotChannelSchema } from '../../schemas/commands';

export type ConnectTelegramBotChannel = z.infer<
  typeof ConnectTelegramBotChannelSchema
>;
