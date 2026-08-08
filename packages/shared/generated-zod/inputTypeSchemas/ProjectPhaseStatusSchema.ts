import { z } from 'zod';

export const ProjectPhaseStatusSchema = z.enum(['PENDING','ACTIVE','COMPLETED','SKIPPED']);

export type ProjectPhaseStatusType = `${z.infer<typeof ProjectPhaseStatusSchema>}`

export default ProjectPhaseStatusSchema;
