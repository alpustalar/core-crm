import { createZodDto } from 'nestjs-zod';
import { BookTransferSchema } from '../../schemas/commands/book-transfer.schema';

export class BookTransferDto extends createZodDto(BookTransferSchema) {}
