import { z } from 'zod';

export const ClinicAiAgentConfigScalarFieldEnumSchema = z.enum(['id','isEnabled','model','systemPrompt','apiKey','maxTokens','replyOnlyWithinWindow','businessHours','clinicId','organizationId','createdAt','updatedAt']);

export default ClinicAiAgentConfigScalarFieldEnumSchema;
