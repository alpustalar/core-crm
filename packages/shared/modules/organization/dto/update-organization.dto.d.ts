declare const UpdateOrganizationDto_base: import("node_modules/nestjs-zod/dist/dto-D-BwC0n0.cjs").t<import("zod").ZodObject<{
    name: import("zod").ZodOptional<import("zod").ZodString>;
    phone: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
    email: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodEmail>>;
    address: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
    city: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
    district: import("zod").ZodOptional<import("zod").ZodOptional<import("zod").ZodString>>;
}, import("zod/v4/core").$strip>, false>;
export declare class UpdateOrganizationDto extends UpdateOrganizationDto_base {
}
export {};
