import { z } from 'zod';

export const ActivityTypeSchema = z.enum(['CALL','NOTE','TASK','MEETING']);

export type ActivityTypeType = `${z.infer<typeof ActivityTypeSchema>}`

export default ActivityTypeSchema;
