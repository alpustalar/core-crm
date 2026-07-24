import { z } from 'zod';
import { MoveLeadToStageSchema } from '../../schemas/commands';

export type MoveLeadToStage = z.infer<typeof MoveLeadToStageSchema>;
