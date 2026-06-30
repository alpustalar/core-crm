import { z } from 'zod';
import { RegisterClinicIyzicoTerminalConfigSchema } from '../../schemas/commands';

export type RegisterClinicIyzicoTerminalConfig = z.infer<
  typeof RegisterClinicIyzicoTerminalConfigSchema
>;
