import { z } from 'zod';

export const ProjectStatusSchema = z.enum(['PLANNING','ACTIVE','ON_HOLD','COMPLETED','CANCELLED']);

export type ProjectStatusType = `${z.infer<typeof ProjectStatusSchema>}`

export default ProjectStatusSchema;
