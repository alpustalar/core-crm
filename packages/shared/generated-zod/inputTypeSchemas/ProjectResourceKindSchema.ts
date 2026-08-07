import { z } from 'zod';

export const ProjectResourceKindSchema = z.enum(['EMPLOYEE','ROOM','EQUIPMENT']);

export type ProjectResourceKindType = `${z.infer<typeof ProjectResourceKindSchema>}`

export default ProjectResourceKindSchema;
