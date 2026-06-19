import { z } from 'zod';
import { RegisterWhatsappChannelSchema } from '../../schemas/commands';

export type RegisterWhatsappChannel = z.infer<
  typeof RegisterWhatsappChannelSchema
>;
