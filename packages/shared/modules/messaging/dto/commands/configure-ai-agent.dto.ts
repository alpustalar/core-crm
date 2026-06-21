import { createZodDto } from 'nestjs-zod';
import { ConfigureAiAgentSchema } from '../../schemas/commands';

export class ConfigureAiAgentDto extends createZodDto(ConfigureAiAgentSchema) {}
