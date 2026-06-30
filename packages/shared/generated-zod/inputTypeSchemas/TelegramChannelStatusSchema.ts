import { z } from 'zod';

export const TelegramChannelStatusSchema = z.enum(['PENDING','ACTIVE','ERROR','REVOKED']);

export type TelegramChannelStatusType = `${z.infer<typeof TelegramChannelStatusSchema>}`

export default TelegramChannelStatusSchema;
