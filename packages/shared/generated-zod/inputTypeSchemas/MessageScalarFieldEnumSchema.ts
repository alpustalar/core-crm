import { z } from 'zod';

export const MessageScalarFieldEnumSchema = z.enum(['id','conversationId','externalId','sentByUserId','replyToExternalId','direction','type','body','mediaUrl','status','errorReason','errorCode','payload','mediaType','pricingCategory','billable','templateName','templateLanguage','templateParams','createdAt','updatedAt']);

export default MessageScalarFieldEnumSchema;
