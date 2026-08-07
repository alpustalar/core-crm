import { z } from 'zod';

export const ProjectTaskPrioritySchema = z.enum(['LOW','MEDIUM','HIGH','URGENT']);

export type ProjectTaskPriorityType = `${z.infer<typeof ProjectTaskPrioritySchema>}`

export default ProjectTaskPrioritySchema;
