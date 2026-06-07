import { createZodDto } from 'nestjs-zod';
import { BookHotelSchema } from '../../schemas/commands';

export class BookHotelDto extends createZodDto(BookHotelSchema) {}
