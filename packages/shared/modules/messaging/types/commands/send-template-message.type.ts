import { z } from 'zod';
import { SendTemplateMessageSchema } from '../../schemas/commands';

export type SendTemplateMessage = z.infer<typeof SendTemplateMessageSchema>;
