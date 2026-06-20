import { z } from 'zod';
import { ConnectWhatsappChannelSchema } from '../../schemas/commands';

export type ConnectWhatsappChannel = z.infer<
  typeof ConnectWhatsappChannelSchema
>;
