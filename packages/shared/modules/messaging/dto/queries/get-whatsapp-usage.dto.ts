import { createZodDto } from 'nestjs-zod';
import { GetWhatsappUsageSchema } from '../../schemas/queries';

export class GetWhatsappUsageDto extends createZodDto(GetWhatsappUsageSchema) {}
