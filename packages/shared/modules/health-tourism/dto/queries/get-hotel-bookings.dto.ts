import { createZodDto } from 'nestjs-zod';
import { GetHotelBookingsSchema } from '../../schemas/queries';

export class GetHotelBookingsDto extends createZodDto(GetHotelBookingsSchema) {}
