import { z } from 'zod';
import { GrantUserCapabilitySchema } from '../../schemas/commands';

export type GrantUserCapability = z.infer<typeof GrantUserCapabilitySchema>;
