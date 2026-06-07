import { z } from 'zod';

export const ENabizSyncStatusSchema = z.enum(['PENDING','SYNCED','FAILED','SKIPPED']);

export type ENabizSyncStatusType = `${z.infer<typeof ENabizSyncStatusSchema>}`

export default ENabizSyncStatusSchema;
