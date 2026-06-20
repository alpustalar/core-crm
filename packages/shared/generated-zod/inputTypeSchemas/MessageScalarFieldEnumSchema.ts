import { z } from 'zod';

export const MessageScalarFieldEnumSchema = z.enum(['id','conversationId','direction','type','body','mediaUrl','status','externalId','errorReason','errorCode','sentByUserId','payload','replyToExternalId','mediaType','pricingCategory','billable','templateName','templateLanguage','templateParams','createdAt','updatedAt']);

export default MessageScalarFieldEnumSchema;
