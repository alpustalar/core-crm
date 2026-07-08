import { z } from 'zod';

export const ClinicAiAgentConfigScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','isEnabled','provider','model','systemPrompt','apiKey','maxTokens','replyOnlyWithinWindow','businessHours','createdAt','updatedAt']);

export default ClinicAiAgentConfigScalarFieldEnumSchema;
