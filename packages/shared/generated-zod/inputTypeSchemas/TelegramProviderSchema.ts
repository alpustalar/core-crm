import { z } from 'zod';

export const TelegramProviderSchema = z.enum(['BOT_API','MTPROTO']);

export type TelegramProviderType = `${z.infer<typeof TelegramProviderSchema>}`

export default TelegramProviderSchema;
