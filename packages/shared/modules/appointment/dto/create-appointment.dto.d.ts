declare const CreateAppointmentDto_base: import("node_modules/nestjs-zod/dist/dto-D-BwC0n0.cjs").t<import("zod").ZodObject<{
    patientId: import("zod").ZodUUID;
    doctorId: import("zod").ZodUUID;
    treatmentId: import("zod").ZodUUID;
    startTime: import("zod").ZodCoercedDate<unknown>;
    duration: import("zod").ZodOptional<import("zod").ZodNumber>;
    notes: import("zod").ZodOptional<import("zod").ZodString>;
    clinicId: import("zod").ZodOptional<import("zod").ZodUUID>;
    externalId: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>, false>;
export declare class CreateAppointmentDto extends CreateAppointmentDto_base {
}
export {};
