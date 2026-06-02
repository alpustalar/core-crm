import { createZodDto } from 'nestjs-zod';
import { PaxBatchCloseSchema } from '../../schemas/commands';

export class PaxBatchCloseDto extends createZodDto(PaxBatchCloseSchema) {}
