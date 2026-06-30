import { z } from 'zod';
import { IyzicoTerminalVoidSchema } from '../../schemas/commands';

export type IyzicoTerminalVoid = z.infer<typeof IyzicoTerminalVoidSchema>;
