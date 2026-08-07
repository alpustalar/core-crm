import { z } from 'zod';

export const ProjectTaskStatusSchema = z.enum(['TODO','IN_PROGRESS','REVIEW','DONE','CANCELLED']);

export type ProjectTaskStatusType = `${z.infer<typeof ProjectTaskStatusSchema>}`

export default ProjectTaskStatusSchema;
