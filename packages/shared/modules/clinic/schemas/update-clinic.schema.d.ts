export declare const UpdateClinicSchema: import("zod").ZodObject<{
    name: import("zod").ZodOptional<import("zod").ZodString>;
    phone: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
    email: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodEmail>>;
    address: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
    city: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
    district: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
    status: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodEnum<{
        ACTIVE: "ACTIVE";
        DELETED: "DELETED";
        SUSPENDED: "SUSPENDED";
        TRIAL: "TRIAL";
    }>>>;
    timezone: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
    organizationId: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodUUID>>;
}, import("zod/v4/core").$strip>;
