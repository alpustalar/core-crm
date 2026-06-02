import { z } from 'zod';
import { ConnectMetaAccountSchema } from '../../schemas/commands';

export type ConnectMetaAccount = z.infer<typeof ConnectMetaAccountSchema>;
