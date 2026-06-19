import { z } from 'zod';

export const MessageScalarFieldEnumSchema = z.enum(['id','conversationId','direction','type','body','mediaUrl','status','externalId','errorReason','sentByUserId','createdAt','updatedAt']);

export default MessageScalarFieldEnumSchema;
