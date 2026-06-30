import { z } from 'zod';
import { IyzicoTerminalEodSchema } from '../../schemas/commands';

export type IyzicoTerminalEod = z.infer<typeof IyzicoTerminalEodSchema>;
