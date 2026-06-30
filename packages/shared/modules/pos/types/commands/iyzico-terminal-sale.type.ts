import { z } from 'zod';
import { IyzicoTerminalSaleSchema } from '../../schemas/commands';

export type IyzicoTerminalSale = z.infer<typeof IyzicoTerminalSaleSchema>;
