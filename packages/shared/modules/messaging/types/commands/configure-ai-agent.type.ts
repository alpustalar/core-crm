import { z } from 'zod';
import { ConfigureAiAgentSchema } from '../../schemas/commands';

export type ConfigureAiAgent = z.infer<typeof ConfigureAiAgentSchema>;
