import { createZodDto } from 'nestjs-zod';
import { MoveLeadToStageSchema } from '../../schemas/commands';

export class MoveLeadToStageDto extends createZodDto(MoveLeadToStageSchema) {}
