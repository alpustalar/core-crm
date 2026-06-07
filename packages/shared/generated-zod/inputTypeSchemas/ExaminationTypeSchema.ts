import { z } from 'zod';

export const ExaminationTypeSchema = z.enum(['FIRST_VISIT','FOLLOW_UP','EMERGENCY']);

export type ExaminationTypeType = `${z.infer<typeof ExaminationTypeSchema>}`

export default ExaminationTypeSchema;
