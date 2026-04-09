import { z } from 'zod';
export declare const PatientStatusSchema: z.ZodEnum<{
    ACTIVE: "ACTIVE";
    INACTIVE: "INACTIVE";
    ARCHIVED: "ARCHIVED";
    DECEASED: "DECEASED";
    BLACKLISTED: "BLACKLISTED";
}>;
export type PatientStatusType = `${z.infer<typeof PatientStatusSchema>}`;
export default PatientStatusSchema;
