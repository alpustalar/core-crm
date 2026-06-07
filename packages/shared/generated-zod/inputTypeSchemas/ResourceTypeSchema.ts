import { z } from 'zod';

export const ResourceTypeSchema = z.enum(['EQUIPMENT','ROOM']);

export type ResourceTypeType = `${z.infer<typeof ResourceTypeSchema>}`

export default ResourceTypeSchema;
