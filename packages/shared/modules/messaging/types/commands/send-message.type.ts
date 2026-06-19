import { z } from 'zod';
import { SendMessageSchema } from '../../schemas/commands';

export type SendMessage = z.infer<typeof SendMessageSchema>;
