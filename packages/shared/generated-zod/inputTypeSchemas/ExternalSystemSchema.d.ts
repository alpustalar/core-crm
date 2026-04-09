import { z } from 'zod';
export declare const ExternalSystemSchema: z.ZodEnum<{
    WHATSAPP: "WHATSAPP";
    N8N: "N8N";
    GOOGLE_CALENDAR: "GOOGLE_CALENDAR";
}>;
export type ExternalSystemType = `${z.infer<typeof ExternalSystemSchema>}`;
export default ExternalSystemSchema;
