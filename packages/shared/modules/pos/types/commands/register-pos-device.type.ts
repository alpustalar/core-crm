import { z } from 'zod';
import { RegisterPosDeviceSchema } from '../../schemas/commands';

export type RegisterPosDevice = z.infer<typeof RegisterPosDeviceSchema>;
