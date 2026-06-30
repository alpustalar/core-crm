import { z } from 'zod';
import { ConnectInstagramChannelSchema } from '../../schemas/commands';

export type ConnectInstagramChannel = z.infer<
  typeof ConnectInstagramChannelSchema
>;
