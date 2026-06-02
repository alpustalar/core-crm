import { createZodDto } from 'nestjs-zod';
import { SetProviderExaminationSchema } from '../schemas/set-provider-examination.schema';

export class SetProviderExaminationDto extends createZodDto(SetProviderExaminationSchema) {}
