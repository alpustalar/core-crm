import { createZodDto } from 'nestjs-zod';
import { InitCheckoutFormSchema } from '../schemas';

export class InitCheckoutFormDto extends createZodDto(InitCheckoutFormSchema) {}
