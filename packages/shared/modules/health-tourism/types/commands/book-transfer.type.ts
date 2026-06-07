import { z } from 'zod';
import { BookTransferSchema } from '../../schemas/commands/book-transfer.schema';

export type BookTransfer = z.infer<typeof BookTransferSchema>;
