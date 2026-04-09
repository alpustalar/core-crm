import { z } from 'zod';
export declare const AppointmentStatusSchema: z.ZodEnum<{
    CONFIRMED: "CONFIRMED";
    CANCELLED: "CANCELLED";
    COMPLETED: "COMPLETED";
    PENDING: "PENDING";
    NOSHOW: "NOSHOW";
}>;
export type AppointmentStatusType = `${z.infer<typeof AppointmentStatusSchema>}`;
export default AppointmentStatusSchema;
